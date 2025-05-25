
import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
  Checkbox,
  Label,
  Separator,
} from "@/components/ui";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  CartesianGrid,
} from "recharts";

// Dummy data in latest structure (dates are not used for this aggregation)
const exercisesData = [
  { date: "2024-05-01", name: "Exercise One", volume_sets: 50, tags: ["#upper", "#push"] },
  { date: "2024-05-01", name: "Exercise Two", volume_sets: 30, tags: ["#lower", "#pull"] },
  { date: "2024-05-02", name: "Exercise One", volume_sets: 60, tags: ["#upper", "#push"] },
  { date: "2024-05-02", name: "Exercise Three", volume_sets: 35, tags: ["#upper", "#pull"] },
  { date: "2024-05-03", name: "Exercise Two", volume_sets: 40, tags: ["#lower", "#cardio"] },
  { date: "2024-05-03", name: "Exercise One", volume_sets: 55, tags: ["#upper", "#push"] },
  { date: "2024-05-04", name: "Exercise Three", volume_sets: 45, tags: ["#lower", "#pull"] },
  { date: "2024-05-04", name: "Exercise Two", volume_sets: 50, tags: ["#lower", "#cardio"] },
  // Add more data
];

// Fixed exercise names for the left chart (aggregate volume across all entries)
const fixedExerciseNames = ["Exercise One", "Exercise Two"];

// Extract all unique tags in the dataset for checkboxes
const getAllTags = (data) => {
  const tagSet = new Set();
  data.forEach((ex) => ex.tags.forEach((tag) => tagSet.add(tag)));
  return Array.from(tagSet).sort(); // Sort tags alphabetically
};

// Process data for the LEFT chart (Fixed Exercises - Total Volume)
const processFixedChartData = (data, fixedNames) => {
  const volumeMap = new Map(); // Map<string, number> : name -> total volume

  fixedNames.forEach(name => volumeMap.set(name, 0)); // Initialize fixed names

  data.forEach(item => {
    if (fixedNames.includes(item.name)) {
      volumeMap.set(item.name, volumeMap.get(item.name) + item.volume_sets);
    }
  });

  const fixedColors = [
      "hsl(var(--chart-1))",
      "hsl(var(--chart-2))",
  ];

  return Array.from(volumeMap.entries()).map(([name, volume], index) => ({
    name,
    volume,
    fill: fixedColors[index % fixedColors.length] // Assign colors
  }));
};

// Process data for the RIGHT chart (Dynamic Tags - Total Volume)
const processDynamicChartData = (data, selectedTags) => {
  const volumeMap = new Map(); // Map<string, number> : tag -> total volume

  selectedTags.forEach(tag => volumeMap.set(tag, 0)); // Initialize selected tags

  data.forEach(item => {
    item.tags.forEach(tag => {
      if (selectedTags.includes(tag)) {
        volumeMap.set(tag, volumeMap.get(tag) + item.volume_sets);
      }
    });
  });

  const dynamicColors = [
    "hsl(var(--chart-3))",
    "hsl(var(--chart-4))",
    "hsl(var(--chart-5))",
    "hsl(var(--chart-6))",
  ];

  return Array.from(volumeMap.entries()).map(([tag, volume], index) => ({
    tag,
    volume,
    fill: dynamicColors[index % dynamicColors.length] // Assign colors
  }));
};

const legendColorBlock = (color) => (
  <span
    className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
    style={{ background: color }}
  ></span>
);

function DualPartDynamicGraphNoDates() {
  // All unique tags for checkboxes
  const allTags = useMemo(() => getAllTags(exercisesData), [exercisesData]);

  // State for selected tags (default to all tags selected)
  const [selectedTags, setSelectedTags] = useState(allTags);

  // Handle checkbox selection
  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  // Process data for the two charts
  const fixedChartData = useMemo(
    () => processFixedChartData(exercisesData, fixedExerciseNames),
    [exercisesData, fixedExerciseNames]
  );

  const dynamicChartData = useMemo(
    () => processDynamicChartData(exercisesData, selectedTags),
    [exercisesData, selectedTags]
  );

  // Determine the maximum volume across both datasets for consistent Y-axis
  const maxFixedVolume = Math.max(...fixedChartData.map(d => d.volume), 0);
  const maxDynamicVolume = Math.max(...dynamicChartData.map(d => d.volume), 0);
  const maxVolume = Math.max(maxFixedVolume, maxDynamicVolume);

  return (
    <div className="flex min-h-screen bg-background text-foreground items-center justify-center px-2 py-8">
      <Card className="max-w-5xl w-full shadow-xl rounded-xl border bg-card">
        <CardHeader>
          <CardTitle className="text-xl md:text-2xl">Total Volume Comparison (Exercises vs. Tags)</CardTitle>
          <CardDescription>
            Left Chart: Total volume for fixed exercises. &nbsp;|&nbsp; Right Chart: Total volume for exercises with selected tags.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
            {/* Checkbox Controls */}
            <div className="w-full lg:w-1/4 flex flex-col gap-2 items-start pt-1">
              <h3 className="text-md font-semibold mb-1">Select Tags</h3>
              {allTags.map((tag, idx) => (
                <div key={tag} className="flex items-center gap-2">
                  <Checkbox
                    id={tag}
                    checked={selectedTags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                    aria-label={tag}
                  />
                  <Label htmlFor={tag}>
                     {/* Using a consistent color block for dynamic tags */}
                    {legendColorBlock("hsl(var(--chart-3))")}
                    {tag}
                  </Label>
                </div>
              ))}
              <Separator className="my-2" />
              <div className="text-xs text-muted-foreground">
                Check one or more tags to visualize their combined total volume.
              </div>
            </div>
            {/* Charts Container */}
            <div className="flex flex-1 gap-2">
              {/* Left Chart: Fixed Exercises */}
              <div className="w-1/2 h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={fixedChartData}
                    margin={{ top: 20, right: 0, left: 0, bottom: 40 }}
                  >
                     <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="name" // X-axis uses exercise names
                      angle={-45}
                      textAnchor="end"
                      tick={{ fontSize: 12, fill: "var(--foreground)" }}
                      height={50}
                    />
                     <YAxis
                        tick={{ fontSize: 12, fill: "var(--foreground)" }}
                        width={40}
                        domain={[0, maxVolume > 0 ? maxVolume * 1.1 : 'auto']} // Consistent Y-axis
                      />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--popover))",
                        borderRadius: 8,
                        border: "1px solid hsl(var(--border))",
                        color: "hsl(var(--foreground))",
                        fontSize: 14,
                      }}
                      formatter={(value) => [`${value}`, "Total Volume"]}
                    />
                     <Legend
                        layout="horizontal"
                        verticalAlign="top"
                        align="center"
                         wrapperStyle={{ top: -20, left: 0, right: 0 }}
                         formatter={(value) => {
                           const item = fixedChartData.find(d => d.name === value);
                           return (
                             <span style={{
                               color: "hsl(var(--muted-foreground))",
                               fontSize: 13,
                               marginLeft: 6,
                             }}>
                               {legendColorBlock(item?.fill)}
                               {value}
                             </span>
                           );
                         }}
                      />

                    <Bar
                      dataKey="volume" // Bar uses the aggregated volume
                      name="Total Volume"
                      radius={[4, 4, 0, 0]}
                      isAnimationActive={true}
                    >
                       {fixedChartData.map((entry, index) => (
                        <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Right Chart: Dynamic Tags */}
              <div className="w-1/2 h-[350px]">
                {selectedTags.length > 0 ? (
                   <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dynamicChartData}
                      margin={{ top: 20, right: 0, left: 0, bottom: 40 }}
                    >
                       <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="tag" // X-axis uses tags
                        angle={-45}
                        textAnchor="end"
                        tick={{ fontSize: 12, fill: "var(--foreground)" }}
                        height={50}
                      />
                       <YAxis
                         tick={{ fontSize: 12, fill: "var(--foreground)" }}
                         width={0} // Hide Y-axis labels on the right chart
                         domain={[0, maxVolume > 0 ? maxVolume * 1.1 : 'auto']} // Consistent Y-axis
                      />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(var(--popover))",
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                          color: "hsl(var(--foreground))",
                          fontSize: 14,
                        }}
                         formatter={(value, name) => [`${value}`, "Total Volume"]}
                      />
                       <Legend
                         layout="horizontal"
                         verticalAlign="top"
                         align="center"
                         wrapperStyle={{ top: -20, left: 0, right: 0 }}
                          formatter={(value) => { // Custom formatter for dynamic tags
                             const item = dynamicChartData.find(d => d.tag === value);
                            return (
                              <span style={{
                                color: "hsl(var(--muted-foreground))",
                                fontSize: 13,
                                marginLeft: 6,
                              }}>
                                {legendColorBlock(item?.fill)}
                                {value}
                              </span>
                            );
                          }}
                       />

                      <Bar
                        dataKey="volume" // Bar uses the aggregated volume for tags
                        name="Total Volume"
                        radius={[4, 4, 0, 0]}
                        isAnimationActive={true}
                       >
                         {dynamicChartData.map((entry, index) => (
                          <Cell key={`cell-${entry.tag}`} fill={entry.fill} />
                        ))}
                       </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                    Select tags to view their combined total volume.
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
import { Cell } from "recharts";
export default DualPartDynamicGraphNoDates;

