/**
 * Universal print trigger that leverages Electron's native print engine if available,
 * and falls back seamlessly to browser window.print().
 */
export async function triggerPrint(): Promise<boolean> {
  if (typeof window !== "undefined") {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI && typeof electronAPI.print === "function") {
      try {
        const res = await electronAPI.print();
        if (res && res.success) return true;
        window.print();
        return true;
      } catch (err) {
        console.warn("Electron print invocation failed, falling back to window.print():", err);
        window.print();
        return true;
      }
    }
    window.print();
    return true;
  }
  return false;
}
