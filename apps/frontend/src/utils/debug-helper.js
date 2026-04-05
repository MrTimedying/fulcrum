// Debug helper for testing Tauri functionality
// This helps debug window controls and other Tauri API issues

window.debugTauri = {
  async testWindowControls() {
    console.log('🔧 Testing Tauri Window Controls...');
    
    try {
      // Test if Tauri is available
      if (typeof window.__TAURI__ === 'undefined') {
        console.error('❌ Tauri is not available - not in Tauri environment');
        return;
      }
      
      console.log('✅ Tauri is available');
      console.log('📦 Available Tauri modules:', Object.keys(window.__TAURI__));
      
      // Test importing APIs
      const { invoke } = await import('@tauri-apps/api/core');
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      
      console.log('✅ Tauri APIs imported successfully');
      
      // Test window object
      const window = getCurrentWindow();
      console.log('✅ Current window object:', window);
      
      // Test invoke function
      console.log('🧪 Testing invoke function...');
      
      // Test each window command
      console.log('🔲 Testing minimize...');
      await invoke('minimize_window');
      console.log('✅ Minimize command sent');
      
      setTimeout(async () => {
        console.log('🔲 Testing maximize...');
        await invoke('maximize_window');
        console.log('✅ Maximize command sent');
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error testing window controls:', error);
      console.error('📋 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
    }
  },

  async testTauriCommands() {
    console.log('🔧 Testing all Tauri commands...');
    
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      
      const commands = [
        'get_app_version',
        'get_app_state',
        'save_app_state'
      ];
      
      for (const command of commands) {
        try {
          console.log(`🧪 Testing command: ${command}`);
          const result = await invoke(command, command === 'save_app_state' ? { state: { test: true } } : {});
          console.log(`✅ ${command} result:`, result);
        } catch (error) {
          console.error(`❌ ${command} failed:`, error);
        }
      }
      
    } catch (error) {
      console.error('❌ Error testing commands:', error);
    }
  },

  async checkEnvironment() {
    console.log('🔧 Checking Tauri environment...');
    
    console.log('🌐 Browser environment:', {
      userAgent: navigator.userAgent,
      isTauri: typeof window.__TAURI__ !== 'undefined',
      tauriObject: window.__TAURI__,
      location: window.location.href
    });
    
    if (typeof window.__TAURI__ !== 'undefined') {
      console.log('📦 Tauri object details:', window.__TAURI__);
    }
  }
};

// Auto-run checks when loaded
console.log('🚀 Debug helper loaded! Use window.debugTauri methods to test.');
console.log('Available methods:');
console.log('- debugTauri.testWindowControls()');
console.log('- debugTauri.testTauriCommands()');
console.log('- debugTauri.checkEnvironment()');

// Auto-check environment on load
window.debugTauri.checkEnvironment(); 