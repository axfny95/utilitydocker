const moduleCache = new Map<string, WebAssembly.Module>();

export async function loadWasmModule(name: string): Promise<WebAssembly.Instance> {
  if (moduleCache.has(name)) {
    return WebAssembly.instantiate(moduleCache.get(name)!);
  }

  const response = await fetch(`/wasm/${name}.wasm`);
  if (!response.ok) {
    throw new Error(`Failed to load WASM module "${name}": ${response.status}`);
  }

  const module = await WebAssembly.compileStreaming(response);
  moduleCache.set(name, module);
  return WebAssembly.instantiate(module);
}

export function isWasmSupported(): boolean {
  try {
    if (typeof WebAssembly === 'object' && typeof WebAssembly.instantiate === 'function') {
      const module = new WebAssembly.Module(
        Uint8Array.of(0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00)
      );
      return module instanceof WebAssembly.Module;
    }
  } catch {
    // WASM not supported
  }
  return false;
}

export function isWebGPUSupported(): boolean {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}
