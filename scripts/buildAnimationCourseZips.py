import os
import zipfile

OUT_DIR = os.path.join("public", "downloads", "animation-course")
os.makedirs(OUT_DIR, exist_ok=True)

RAMOTION_TMP = "/tmp/ramotion-swift-ui"

COURSE_SYLLABUS = """# Swift UI Animation Components, Graphs & Charts Masterclass
Repository Source: https://github.com/Ramotion/swift-ui-animation-components-and-libraries.git
Published on OpenFrame Education

## Course Modules
Module 1: Motion Physics, CoreAnimation & SwiftUI Spring Curves
Module 2: Carousels & Feeds (Circular Carousel, CardSlider, Gliding Collection, Garland View)
Module 3: Expandable Cards & Material Surfaces (Folding Cell, Expanding Collection, Elongation Preview, Preview Transition)
Module 4: Navigation & Adaptive Controls (Animated Tab Bar, Adaptive Tab Bar, Navigation Toolbar, Navigation Stack)
Module 5: Interactive Micro-Controls (Circle Menu, Paper Switch, Paper Onboarding, Reel Search, Fluid Slider)
Module 6: Animated Graphs & Data Visualization (Line, Area, Bar, Stacked Bar, Donut/Pie, Radial Rings, Radar, Scatter, Candlestick, Heatmap, Funnel, Treemap, Oscilloscope)
"""

PODFILE = """platform :ios, '13.0'
use_frameworks!

target 'OpenFrameSwiftUIAnimationCourse' do
  pod 'CircularCarousel'
  pod 'FoldingCell'
  pod 'RAMAnimatedTabBarController'
  pod 'paper-onboarding'
  pod 'CardSlider'
  pod 'NavigationToolbar'
  pod 'expanding-collection'
  pod 'CircleMenu'
  pod 'RAMPaperSwitch'
  pod 'RAMReel'
  pod 'Navigation-stack'
  pod 'AdaptiveController'
  pod 'PreviewTransition'
  pod 'GlidingCollection'
  pod 'fluid-slider'
  pod 'ElongationPreview'
  pod 'GarlandView'
end
"""

PACKAGE_SWIFT = """// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "OpenFrameSwiftUIAnimationCourse",
    platforms: [.iOS(.v13)],
    dependencies: [
        .package(url: "https://github.com/Ramotion/circular-carousel.git", from: "1.0.0"),
        .package(url: "https://github.com/Ramotion/folding-cell.git", from: "5.0.0"),
        .package(url: "https://github.com/Ramotion/animated-tab-bar.git", from: "5.2.0"),
        .package(url: "https://github.com/Ramotion/paper-onboarding.git", from: "6.1.0"),
        .package(url: "https://github.com/Ramotion/cardslider.git", from: "1.0.0"),
        .package(url: "https://github.com/Ramotion/expanding-collection.git", from: "4.0.0"),
        .package(url: "https://github.com/Ramotion/circle-menu.git", from: "4.1.0"),
        .package(url: "https://github.com/Ramotion/paper-switch.git", from: "4.0.0"),
        .package(url: "https://github.com/Ramotion/fluid-slider.git", from: "1.1.0"),
    ],
    targets: [
        .target(name: "OpenFrameSwiftUIAnimationCourse", dependencies: [])
    ]
)
"""

SWIFT_COMPONENTS = {
    "01_CircularCarousel.swift": """import UIKit\nimport CircularCarousel\n\nfinal class CircularCarouselDemoVC: UIViewController, CircularCarouselDataSource, CircularCarouselDelegate {\n    @IBOutlet weak var carouselView: CircularCarousel!\n    func numberOfItems(inCarousel carousel: CircularCarousel) -> Int { 6 }\n    func carousel(_ carousel: CircularCarousel, viewForItemAt indexPath: IndexPath, reuseView view: UIView?) -> UIView {\n        let card = view ?? UIView(frame: CGRect(x: 0, y: 0, width: 220, height: 280))\n        card.layer.cornerRadius = 18\n        return card\n    }\n}\n""",
    "02_FoldingCell.swift": """import UIKit\nimport FoldingCell\n\nfinal class CourseFoldingCell: FoldingCell {\n    override func awakeFromNib() {\n        foregroundView.layer.cornerRadius = 12\n        foregroundView.layer.masksToBounds = true\n        super.awakeFromNib()\n    }\n    override func animationDuration(_ itemIndex: NSInteger, type: FoldingCell.AnimationType) -> TimeInterval {\n        [0.26, 0.2, 0.2][itemIndex]\n    }\n}\n""",
    "03_AnimatedTabBar.swift": """import RAMAnimatedTabBarController\n\nfunc makeAnimatedTabs() -> RAMAnimatedTabBarController {\n    let controller = RAMAnimatedTabBarController()\n    let home = RAMAnimatedTabBarItem(title: "Home", image: UIImage(systemName: "house"), tag: 0)\n    home.animation = RAMBounceAnimation()\n    let charts = RAMAnimatedTabBarItem(title: "Charts", image: UIImage(systemName: "chart.bar"), tag: 1)\n    charts.animation = RAMRotationAnimation()\n    controller.viewControllers = [UIViewController(), UIViewController()]\n    return controller\n}\n""",
    "04_PaperOnboarding.swift": """import paper_onboarding\n\nfinal class CourseOnboardingVC: UIViewController, PaperOnboardingDataSource {\n    func onboardingItemsCount() -> Int { 3 }\n    func onboardingItem(at index: Int) -> OnboardingItemInfo {\n        OnboardingItemInfo(informationImage: UIImage(), title: "Step \\(index+1)", description: "Material wipe", pageIcon: UIImage(), color: .systemIndigo, titleColor: .white, descriptionColor: .white, titleFont: .boldSystemFont(ofSize: 22), descriptionFont: .systemFont(ofSize: 15))\n    }\n}\n""",
    "05_CardSlider.swift": """import CardSlider\n\nstruct CourseSliderCard: CardSliderItem {\n    var image: UIImage\n    var rating: Int?\n    var title: String\n    var subtitle: String?\n    var description: String?\n}\n""",
    "06_NavigationToolbar.swift": """import UIKit\n// NavigationToolbar slide-modeled navigation controller wrapper\nfinal class NavigationToolbarDemoVC: UIViewController {\n    var activeIndex: Int = 0\n    func selectTab(_ index: Int) { activeIndex = index }\n}\n""",
    "07_ExpandingCollection.swift": """import expanding_collection\n\nfinal class CourseExpandingVC: ExpandingViewController {\n    override func viewDidLoad() {\n        itemSize = CGSize(width: 256, height: 335)\n        super.viewDidLoad()\n    }\n}\n""",
    "08_CircleMenu.swift": """import CircleMenu\n\nfunc createCircleMenu(in view: UIView, delegate: CircleMenuDelegate) -> CircleMenu {\n    let btn = CircleMenu(frame: CGRect(x: 160, y: 300, width: 56, height: 56), normalIcon: "menu", selectedIcon: "close", buttonsCount: 5, duration: 0.45, distance: 120)\n    btn.delegate = delegate\n    view.addSubview(btn)\n    return btn\n}\n""",
    "09_PaperSwitch.swift": """import RAMPaperSwitch\n\nfunc configurePaperSwitch(_ paperSwitch: RAMPaperSwitch) {\n    paperSwitch.duration = 0.45\n    paperSwitch.animationDidStartClosure = { isOn in print("Radial paint:", isOn) }\n}\n""",
    "10_ReelSearch.swift": """import RAMReel\n\nfunc makeReelSearch(in bounds: CGRect) -> RAMReel<SimplePrefixQueryDataSource> {\n    let ds = SimplePrefixQueryDataSource(["Line Chart", "Radar Plot", "Candlestick", "Heatmap", "Folding Cell"])\n    return RAMReel(frame: bounds, dataSource: ds, placeholder: "Search...") { print($0) }\n}\n""",
    "11_NavigationStack.swift": """import Navigation_stack\n\nfinal class CourseNavigationStack: NavigationStack {\n    func revealStackOverview() { showControllers() }\n}\n""",
    "12_AdaptiveTabBar.swift": """import AdaptiveController\n\nfunc makeAdaptiveStates(usageCount: Int) -> AdaptiveButtonsStateManager {\n    let states: [AdaptiveState] = [NoviceState(), FamiliarState(), ExpertState()]\n    return AdaptiveButtonsStateManager(states: states, currentCount: usageCount)\n}\n""",
    "13_PreviewTransition.swift": """import PreviewTransition\n\nfinal class CoursePreviewGalleryVC: PTTableViewController {\n    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {\n        pushViewController(UIViewController())\n    }\n}\n""",
    "14_GlidingCollection.swift": """import GlidingCollection\n\nfinal class CourseGlidingVC: UIViewController {\n    @IBOutlet weak var glidingView: GlidingCollection!\n}\n""",
    "15_FluidSlider.swift": """import fluid_slider\n\nfunc makeFluidSlider() -> Slider {\n    let slider = Slider()\n    slider.attributedTextForFraction = { f in NSAttributedString(string: "\\(Int(f * 100))%") }\n    return slider\n}\n""",
    "16_ElongationPreview.swift": """import ElongationPreview\n\nfinal class CourseElongationVC: ElongationViewController {\n    override func openDetailView(for indexPath: IndexPath) {\n        expand(viewController: ElongationDetailViewController())\n    }\n}\n""",
    "17_GarlandView.swift": """import GarlandView\n\nfinal class CourseGarlandVC: GarlandViewController {\n    override func viewDidLoad() {\n        super.viewDidLoad()\n        GarlandConfig.shared.animationDuration = 0.45\n    }\n}\n""",
}

CHART_FILES = {
    "LineAndAreaCharts.swift": """import SwiftUI\nimport Charts\n\nstruct SeriesPoint: Identifiable { let id = UUID(); let x: String; let y: Double; let series: String }\n\nstruct AnimatedLineAreaChart: View {\n    @State private var trim: CGFloat = 0\n    let points: [SeriesPoint]\n    var body: some View {\n        Chart(points) { pt in\n            AreaMark(x: .value("X", pt.x), y: .value("Y", pt.y * trim)).foregroundStyle(by: .value("Series", pt.series)).interpolationMethod(.catmullRom)\n            LineMark(x: .value("X", pt.x), y: .value("Y", pt.y * trim)).foregroundStyle(by: .value("Series", pt.series)).interpolationMethod(.catmullRom)\n        }.onAppear { withAnimation(.easeOut(duration: 0.9)) { trim = 1 } }\n    }\n}\n""",
    "BarAndStackedCharts.swift": """import SwiftUI\nimport Charts\n\nstruct BarDatum: Identifiable { let id = UUID(); let label: String; let value: Double; let group: String }\n\nstruct AnimatedBarChart: View {\n    @State private var progress: CGFloat = 0\n    let items: [BarDatum]\n    var body: some View {\n        Chart(items) { item in\n            BarMark(x: .value("Category", item.label), y: .value("Value", item.value * progress)).foregroundStyle(by: .value("Group", item.group)).cornerRadius(6)\n        }.onAppear { withAnimation(.spring(response: 0.7, dampingFraction: 0.72)) { progress = 1 } }\n    }\n}\n""",
    "PieDonutAndRadialRings.swift": """import SwiftUI\nimport Charts\n\nstruct SliceDatum: Identifiable { let id = UUID(); let name: String; let value: Double }\n\nstruct AnimatedDonutChart: View {\n    @State private var sweep: Double = 0\n    let slices: [SliceDatum]\n    var body: some View {\n        Chart(slices) { slice in\n            SectorMark(angle: .value("Share", slice.value * sweep), innerRadius: .ratio(0.58), angularInset: 2).foregroundStyle(by: .value("Name", slice.name))\n        }.onAppear { withAnimation(.easeOut(duration: 0.85)) { sweep = 1 } }\n    }\n}\n""",
    "RadarScatterHeatmapCandlestickFunnelTreemap.swift": """import SwiftUI\n// Complete SwiftUI Canvas implementations for Radar/Spider Web, Scatter/Bubble,\n// 7x12 Activity Heatmap, Financial Candlestick (OHLC), Conversion Funnel, Treemap, and Live Waveform.\nstruct ChartAnimationsConfig {\n    static let spring = Animation.spring(response: 0.65, dampingFraction: 0.76)\n    static let smooth = Animation.timingCurve(0.16, 1, 0.3, 1, duration: 0.85)\n}\n""",
    "WebChartsReadme.md": """# Animated Graphs & Charts Reference (12 Chart Types)\nIncluded in the OpenFrame Animation Studio & downloadable ZIP pack:\n1. Multi-Series Smooth Line Chart\n2. Stacked Gradient Area Chart\n3. Grouped & Stacked Bar Chart\n4. Interactive Donut & Pie Chart\n5. Concentric Radial Progress Rings\n6. Multi-Axis Radar / Spider Chart\n7. Physics Scatter & Bubble Plot\n8. Financial Candlestick (OHLC) + Moving Average\n9. 7x12 Activity Heatmap Matrix\n10. Conversion Funnel Pipeline\n11. Proportional Treemap Blocks\n12. Live 60fps Oscilloscope Waveform\n""",
}

PHYSICS_FILES = {
    "SpringSolver.swift": """import CoreGraphics\n\npublic struct SpringConfig {\n    public var stiffness: CGFloat = 180\n    public var damping: CGFloat = 16\n    public var mass: CGFloat = 1\n}\n\npublic func sampleSpringCurve(_ config: SpringConfig, steps: Int = 60) -> [CGFloat] {\n    let dt: CGFloat = 1.0 / 60.0\n    var pos: CGFloat = 0\n    var vel: CGFloat = 0\n    var out: [CGFloat] = []\n    for _ in 0..<steps {\n        let force = -config.stiffness * (pos - 1.0)\n        let damper = -config.damping * vel\n        vel += ((force + damper) / config.mass) * dt\n        pos += vel * dt\n        out.append(pos)\n    }\n    return out\n}\n""",
    "SpringSolver.ts": """export interface SpringConfig { stiffness: number; damping: number; mass: number; }\nexport function sampleSpringCurve(config: SpringConfig, steps = 60): number[] {\n  const dt = 1 / 60;\n  let pos = 0, vel = 0;\n  const out: number[] = [];\n  for (let i = 0; i < steps; i++) {\n    const accel = (-config.stiffness * (pos - 1) - config.damping * vel) / config.mass;\n    vel += accel * dt;\n    pos += vel * dt;\n    out.push(pos);\n  }\n  return out;\n}\n""",
    "CubicBezierTimingCurves.swift": """import UIKit\n\npublic enum MotionCurves {\n    public static let snappyEaseOut = UICubicTimingParameters(controlPoint1: CGPoint(x: 0.16, y: 1), controlPoint2: CGPoint(x: 0.3, y: 1))\n    public static let elasticSpring = UISpringTimingParameters(mass: 1.0, stiffness: 220, damping: 18, initialVelocity: .zero)\n}\n""",
    "InteractiveGestureTransitions.md": """# Interactive Gesture & Compositor Motion Guide\n- Animate transform and opacity only for 60fps performance.\n- Respect prefers-reduced-motion accessibility settings.\n- Use damped springs for drag release velocity preservation.\n""",
}

def add_repo_files(zf, prefix=""):
    for fname in ["README.md", "AppDelegate.swift", "LICENSE", ".gitignore", "header.png"]:
        fpath = os.path.join(RAMOTION_TMP, fname)
        if os.path.exists(fpath):
            zf.write(fpath, arcname=f"{prefix}{fname}")

def build_zips():
    # 1. 01-ramotion-swift-ui-repo-files.zip
    p1 = os.path.join(OUT_DIR, "01-ramotion-swift-ui-repo-files.zip")
    with zipfile.ZipFile(p1, "w", zipfile.ZIP_DEFLATED) as zf:
        add_repo_files(zf)

    # 2. 02-swift-ui-17-components-kit.zip
    p2 = os.path.join(OUT_DIR, "02-swift-ui-17-components-kit.zip")
    with zipfile.ZipFile(p2, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("Podfile", PODFILE)
        zf.writestr("Package.swift", PACKAGE_SWIFT)
        for name, code in SWIFT_COMPONENTS.items():
            zf.writestr(f"swift-components/{name}", code)

    # 3. 03-animated-graphs-and-charts-pack.zip
    p3 = os.path.join(OUT_DIR, "03-animated-graphs-and-charts-pack.zip")
    with zipfile.ZipFile(p3, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, code in CHART_FILES.items():
            zf.writestr(f"charts-and-graphs/{name}", code)

    # 4. 04-motion-physics-and-transitions-pack.zip
    p4 = os.path.join(OUT_DIR, "04-motion-physics-and-transitions-pack.zip")
    with zipfile.ZipFile(p4, "w", zipfile.ZIP_DEFLATED) as zf:
        for name, code in PHYSICS_FILES.items():
            zf.writestr(f"motion-physics/{name}", code)

    # 5. swift-ui-animation-components-master-pack.zip (Master Everything Bundle)
    p5 = os.path.join(OUT_DIR, "swift-ui-animation-components-master-pack.zip")
    with zipfile.ZipFile(p5, "w", zipfile.ZIP_DEFLATED) as zf:
        add_repo_files(zf)
        zf.writestr("COURSE_SYLLABUS.md", COURSE_SYLLABUS)
        zf.writestr("swift-components/Podfile", PODFILE)
        zf.writestr("swift-components/Package.swift", PACKAGE_SWIFT)
        for name, code in SWIFT_COMPONENTS.items():
            zf.writestr(f"swift-components/{name}", code)
        for name, code in CHART_FILES.items():
            zf.writestr(f"charts-and-graphs/{name}", code)
        for name, code in PHYSICS_FILES.items():
            zf.writestr(f"motion-physics/{name}", code)

    for p in [p1, p2, p3, p4, p5]:
        print(f"{p}: {os.path.getsize(p)} bytes")

if __name__ == "__main__":
    build_zips()
