use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use chrono::{NaiveDate, Duration};
use rayon::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Exercise {
    pub id: String,
    pub name: String,
    pub reps_variant: Option<String>,
    pub intensity_string: Option<String>,
    pub sets: Option<i32>,
    pub reps: Option<i32>,
    pub intensity: Option<f64>,
    pub tags: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub id: String,
    pub name: String,
    pub date: String,
    pub exercises: HashMap<String, Exercise>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AggregatedMetrics {
    pub total_volume: f64,
    pub avg_intensity: f64,
    pub session_count: usize,
    pub tag_distribution: HashMap<String, f64>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TrendPoint {
    pub name: String,
    pub date: String,
    pub volume: f64,
    pub intensity: f64,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AnalysisResult {
    pub summary: AggregatedMetrics,
    pub trend_data: Vec<TrendPoint>,
}

/// Parses a variant string (e.g., "10;12;10;") into a vector of numerical values.
pub fn parse_variant_string(variant_str: &str) -> Vec<f64> {
    if variant_str.is_empty() {
        return Vec::new();
    }
    variant_str
        .split(';')
        .filter(|s| !s.trim().is_empty())
        .map(|s| s.replace(',', ".").parse::<f64>().unwrap_or(0.0))
        .collect()
}

/// Calculates the total volume for a single exercise.
pub fn calculate_exercise_volume(exercise: &Exercise) -> f64 {
    let reps = parse_variant_string(exercise.reps_variant.as_deref().unwrap_or(""));
    let intensities = parse_variant_string(exercise.intensity_string.as_deref().unwrap_or(""));

    if reps.is_empty() {
        return (exercise.sets.unwrap_or(0) as f64)
            * (exercise.reps.unwrap_or(0) as f64)
            * (exercise.intensity.unwrap_or(0.0));
    }

    reps.iter()
        .enumerate()
        .map(|(i, &r)| {
            let intensity = intensities.get(i).or_else(|| intensities.first()).copied().unwrap_or(0.0);
            r * intensity
        })
        .sum()
}

/// Extracts tags from an exercise string and normalizes them.
pub fn get_exercise_tags(exercise: &Exercise) -> Vec<String> {
    exercise.tags.as_deref().unwrap_or("")
        .split(';')
        .map(|t| t.trim().to_lowercase())
        .filter(|t| !t.is_empty() && t.starts_with('#'))
        .collect()
}

#[tauri::command]
pub fn calculate_hierarchical_metrics(
    sessions: Vec<Session>,
    selected_tags: Option<Vec<String>>,
) -> AnalysisResult {
    let tags_filter: Vec<String> = selected_tags
        .unwrap_or_default()
        .into_iter()
        .map(|t| t.to_lowercase())
        .collect();
    let has_filter = !tags_filter.is_empty();

    let intermediate_results: Vec<_> = sessions
        .par_iter()
        .map(|session| {
            let mut total_volume = 0.0;
            let mut total_intensity = 0.0;
            let mut exercise_count = 0;
            let mut tag_volume_map: HashMap<String, f64> = HashMap::new();

            for exercise in session.exercises.values() {
                let exercise_tags = get_exercise_tags(exercise);
                
                let matches_filter = if has_filter {
                    tags_filter.iter().any(|t| exercise_tags.contains(t))
                } else {
                    true
                };

                if matches_filter {
                    let volume = calculate_exercise_volume(exercise);
                    total_volume += volume;
                    total_intensity += exercise.intensity.unwrap_or(0.0);
                    exercise_count += 1;

                    for tag in exercise_tags {
                        *tag_volume_map.entry(tag).or_insert(0.0) += volume;
                    }
                }
            }

            (TrendPoint {
                name: session.name.clone(),
                date: session.date.clone(),
                volume: total_volume,
                intensity: if exercise_count > 0 { total_intensity / exercise_count as f64 } else { 0.0 },
            }, tag_volume_map, exercise_count)
        })
        .collect();

    let mut filtered_results: Vec<_> = intermediate_results
        .into_iter()
        .filter(|(_, _, count)| !has_filter || *count > 0)
        .collect();

    // Sort trend data by date
    filtered_results.sort_by(|a, b| a.0.date.cmp(&b.0.date));

    let mut total_global_volume = 0.0;
    let mut total_global_intensity = 0.0;
    let mut global_tag_distribution: HashMap<String, f64> = HashMap::new();
    let mut trend_points = Vec::with_capacity(filtered_results.len());

    for (point, tags, _) in filtered_results {
        total_global_volume += point.volume;
        total_global_intensity += point.intensity;
        for (tag, vol) in tags {
            *global_tag_distribution.entry(tag).or_insert(0.0) += vol;
        }
        trend_points.push(point);
    }

    let avg_intensity = if !trend_points.is_empty() {
        total_global_intensity / trend_points.len() as f64
    } else {
        0.0
    };

    AnalysisResult {
        summary: AggregatedMetrics {
            total_volume: total_global_volume,
            avg_intensity,
            session_count: trend_points.len(),
            tag_distribution: global_tag_distribution,
        },
        trend_data: trend_points,
    }
}

#[tauri::command]
pub fn calculate_acwr(
    sessions: Vec<Session>,
    target_date: String,
) -> f64 {
    let target = NaiveDate::parse_from_str(&target_date, "%Y-%m-%d").unwrap_or_else(|_| {
         chrono::Utc::now().date_naive()
    });

    let acute_start = target - Duration::days(7);
    let chronic_start = target - Duration::days(28);

    let mut acute_volume_sum = 0.0;
    let mut chronic_volume_sum = 0.0;

    for session in &sessions {
        if let Ok(date) = NaiveDate::parse_from_str(&session.date, "%Y-%m-%d") {
            let volume: f64 = session.exercises.values().map(calculate_exercise_volume).sum();
            
            if date > acute_start && date <= target {
                acute_volume_sum += volume;
            }
            if date > chronic_start && date <= target {
                chronic_volume_sum += volume;
            }
        }
    }

    let acute_avg = acute_volume_sum / 7.0;
    let chronic_avg = chronic_volume_sum / 28.0;

    if chronic_avg > 0.0 {
        acute_avg / chronic_avg
    } else {
        0.0
    }
}
