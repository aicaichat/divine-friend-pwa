import { create } from 'zustand'

interface LayoutState {
  sidebarCollapsed: boolean
  isMobile: boolean
  showMobileOverlay: boolean
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setIsMobile: (mobile: boolean) => void
  setShowMobileOverlay: (show: boolean) => void
  getSidebarWidth: () => number
}

export const useLayoutStore = create<LayoutState>((set, get) => ({
  sidebarCollapsed: false,
  isMobile: false,
  showMobileOverlay: false,
  
  toggleSidebar: () => {
    const { isMobile } = get()
    if (isMobile) {
      // 移动端切换遮罩层显示
      set((state) => ({ 
        showMobileOverlay: !state.showMobileOverlay
      }))
    } else {
      // 桌面端切换折叠状态
      set((state) => ({ 
        sidebarCollapsed: !state.sidebarCollapsed 
      }))
    }
  },
  
  setSidebarCollapsed: (collapsed: boolean) => {
    set({ sidebarCollapsed: collapsed })
  },
  
  setIsMobile: (mobile: boolean) => {
    set({ 
      isMobile: mobile,
      // 移动端自动折叠侧边栏
      sidebarCollapsed: mobile ? true : get().sidebarCollapsed,
      // 移动端隐藏遮罩层
      showMobileOverlay: mobile ? false : get().showMobileOverlay
    })
  },
  
  setShowMobileOverlay: (show: boolean) => {
    set({ showMobileOverlay: show })
  },
  
  getSidebarWidth: () => {
    const { sidebarCollapsed, isMobile } = get()
    if (isMobile) {
      return 0 // 移动端不占用布局空间
    }
    return sidebarCollapsed ? 80 : 240
  }
})) 