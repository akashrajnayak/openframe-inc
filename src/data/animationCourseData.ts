export interface SwiftAnimationComponentItem {
  id: string;
  number: number;
  name: string;
  slug: string;
  category: 'Carousels & Feeds' | 'Cards & Lists' | 'Navigation' | 'Controls & Switches' | 'Onboarding & Media';
  tagline: string;
  description: string;
  repoUrl: string;
  installGuideUrl: string;
  requirementsUrl: string;
  gifRef: string;
  requirements: {
    ios: string;
    swift: string;
    xcode: string;
  };
  installation: {
    cocoapods: string;
    carthage: string;
    spm: string;
  };
  animationPhysics: string;
  easingCurve: string;
  swiftCode: string;
}

export interface ZipPackMeta {
  id: string;
  filename: string;
  downloadUrl: string;
  title: string;
  subtitle: string;
  sizeLabel: string;
  fileCount: number;
  contents: string[];
  badge: string;
}

export interface ArchivePreviewFile {
  path: string;
  folder: string;
  language: 'markdown' | 'swift' | 'typescript' | 'text';
  description: string;
  content: string;
}

export const RAMOTION_ORIGINAL_README = `<a href="https://www.ramotion.com/agency/app-development/"><img src="/assets/images/ramotion_header.png" alt="Swift UI Animation Libraries" /></a>

# Swift UI Animation Libraries
A curated list of Swift libraries, iOS UI components and UI app development by Ramotion.

1. Circular Carousel (https://github.com/Ramotion/circular-carousel)
   List a collection of items in a horizontally scrolling view. A scaling factor controls the size of the items relative to the center.
2. Folding Cell (https://github.com/Ramotion/folding-cell)
   Expanding content cell with animation inspired by folding paper card material design.
3. Animated Tab Bar (https://github.com/Ramotion/animated-tab-bar)
   Swift UI module library for adding animation to iOS tabbar items and icons.
4. Paper Onboarding (https://github.com/Ramotion/paper-onboarding)
   iOS library Paper Onboarding is a material design UI slider written on Swift.
5. CardSlider (https://github.com/Ramotion/cardslider)
   UI controller that allows you to swipe through cards with pictures.
6. Navigation Toolbar (https://github.com/Ramotion/navigation-toolbar)
   Navigation toolbar is a Swift slide-modeled UI navigation controller.
7. Expanding Collection (https://github.com/Ramotion/expanding-collection)
   An animated material design UI card peek/pop controller.
8. Circle Menu (https://github.com/Ramotion/circle-menu)
   A simple, elegant UI menu with a circular layout and material design animations.
9. Paper Switch (https://github.com/Ramotion/paper-switch)
   A Swift material design UI module which paints over the parent view when the switch is on.
10. Reel Search (https://github.com/Ramotion/reel-search)
    Reel Search is a Swift UI controller that allows you to choose options from a list.
11. Navigation Stack (https://github.com/Ramotion/navigation-stack)
    Navigation Stack is a library with stack-modeled UI navigation controller.
12. Adaptive Tab Bar (https://github.com/Ramotion/adaptive-tab-bar)
    'Progressive Reduction' module for adding custom states to Native or Custom UI elements.
13. Preview Transition (https://github.com/Ramotion/preview-transition)
    Preview Transition is a simple preview gallery UI controller with animated transitions.
14. Gliding Collection (https://github.com/Ramotion/gliding-collection)
    A smooth, flowing, customizable decision for a UICollectionView Swift Controller.
15. Fluid Slider (https://github.com/Ramotion/fluid-slider)
    A slider widget with a popup bubble displaying the precise value selected written on Swift.
16. Elongation Preview (https://github.com/Ramotion/elongation-preview)
    Elongation Preview is an elegant UI push-pop style view controller for iOS.
17. Garland View (https://github.com/Ramotion/garland-view)
    Garland View seamlessly transitions between multiple lists of content.

License: MIT License (Copyright 2018 Ramotion)`;

export const RAMOTION_APP_DELEGATE_SWIFT = `//
//  AppDelegate.swift
//
// Copyright (c) 21/12/15. Ramotion Inc. (http://ramotion.com)
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_: UIApplication, didFinishLaunchingWithOptions _: [UIApplicationLaunchOptionsKey: Any]? = nil) -> Bool {
        return true
    }
}`;

export const RAMOTION_LICENSE = `The MIT License (MIT)

Copyright (c) 2018 Ramotion

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`;

export const SWIFT_ANIMATION_COMPONENTS: SwiftAnimationComponentItem[] = [
  {
    id: 'circular-carousel',
    number: 1,
    name: 'Circular Carousel',
    slug: 'circular-carousel',
    category: 'Carousels & Feeds',
    tagline: 'Horizontal scale-interpolated carousel controller',
    description: 'List a collection of items in a horizontally scrolling view. A scaling factor controls the size and elevation of each card relative to the viewport center.',
    repoUrl: 'https://github.com/Ramotion/circular-carousel',
    installGuideUrl: 'https://github.com/Ramotion/circular-carousel#installation',
    requirementsUrl: 'https://github.com/Ramotion/circular-carousel#requirements',
    gifRef: 'ios_circular_carousel.gif',
    requirements: { ios: 'iOS 11.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'CircularCarousel'`,
      carthage: `github "Ramotion/circular-carousel"`,
      spm: `https://github.com/Ramotion/circular-carousel.git`,
    },
    animationPhysics: 'Distance-normalized cosine scale interpolation (minScale 0.72 → center 1.0)',
    easingCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    swiftCode: `import UIKit
import CircularCarousel

class CarouselViewController: UIViewController, CircularCarouselDataSource, CircularCarouselDelegate {
    @IBOutlet weak var carouselView: CircularCarousel!

    func numberOfItems(inCarousel carousel: CircularCarousel) -> Int { return 6 }

    func carousel(_ carousel: CircularCarousel, viewForItemAt indexPath: IndexPath, reuseView view: UIView?) -> UIView {
        let card = view ?? UIView(frame: CGRect(x: 0, y: 0, width: 220, height: 280))
        card.layer.cornerRadius = 18
        return card
    }

    func startingItemIndex(inCarousel carousel: CircularCarousel) -> Int { return 0 }
}`,
  },
  {
    id: 'folding-cell',
    number: 2,
    name: 'Folding Cell',
    slug: 'folding-cell',
    category: 'Cards & Lists',
    tagline: '3D origami paper-folding expanding table cell',
    description: 'Expanding content cell with multi-segment 3D CATransform3D rotation inspired by folding paper material design cards.',
    repoUrl: 'https://github.com/Ramotion/folding-cell',
    installGuideUrl: 'https://github.com/Ramotion/folding-cell#installation',
    requirementsUrl: 'https://github.com/Ramotion/folding-cell#requirements',
    gifRef: 'gifs/folding-cell.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'FoldingCell'`,
      carthage: `github "Ramotion/folding-cell"`,
      spm: `https://github.com/Ramotion/folding-cell.git`,
    },
    animationPhysics: 'Sequential 3D perspective fold (m34 = -1/500) across 3 chained flip panels',
    easingCurve: 'cubic-bezier(0.4, 0, 0.2, 1)',
    swiftCode: `import FoldingCell

class DemoCell: FoldingCell {
    override func awakeFromNib() {
        foregroundView.layer.cornerRadius = 12
        foregroundView.layer.masksToBounds = true
        super.awakeFromNib()
    }

    override func animationDuration(_ itemIndex: NSInteger, type: FoldingCell.AnimationType) -> TimeInterval {
        let durations = [0.26, 0.2, 0.2]
        return durations[itemIndex]
    }
}`,
  },
  {
    id: 'animated-tab-bar',
    number: 3,
    name: 'Animated Tab Bar',
    slug: 'animated-tab-bar',
    category: 'Navigation',
    tagline: 'RAMAnimatedTabBarController with icon motion presets',
    description: 'Swift UI module library for adding spring bounce, frame-by-frame, rotation, and smoke-drop animations to iOS tab bar items and icons.',
    repoUrl: 'https://github.com/Ramotion/animated-tab-bar',
    installGuideUrl: 'https://github.com/Ramotion/animated-tab-bar#installation',
    requirementsUrl: 'https://github.com/Ramotion/animated-tab-bar#requirements',
    gifRef: 'gifs/animated-tab-bar.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'RAMAnimatedTabBarController'`,
      carthage: `github "Ramotion/animated-tab-bar"`,
      spm: `https://github.com/Ramotion/animated-tab-bar.git`,
    },
    animationPhysics: 'CAKeyframeAnimation scale/rotation impulses + tint crossfade',
    easingCurve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    swiftCode: `import RAMAnimatedTabBarController

let tabBarController = RAMAnimatedTabBarController()
let homeItem = RAMAnimatedTabBarItem(title: "Home", image: UIImage(named: "home"), tag: 0)
homeItem.animation = RAMBounceAnimation()
let statsItem = RAMAnimatedTabBarItem(title: "Charts", image: UIImage(named: "chart"), tag: 1)
statsItem.animation = RAMRotationAnimation()`,
  },
  {
    id: 'paper-onboarding',
    number: 4,
    name: 'Paper Onboarding',
    slug: 'paper-onboarding',
    category: 'Onboarding & Media',
    tagline: 'Radial color-flood material design UI slider',
    description: 'iOS onboarding slider written in Swift that reveals each upcoming step via an expanding radial circle mask synced to bottom page indicators.',
    repoUrl: 'https://github.com/Ramotion/paper-onboarding',
    installGuideUrl: 'https://github.com/Ramotion/paper-onboarding#installation',
    requirementsUrl: 'https://github.com/Ramotion/paper-onboarding#requirements',
    gifRef: 'gifs/paper-onboarding.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'paper-onboarding'`,
      carthage: `github "Ramotion/paper-onboarding"`,
      spm: `https://github.com/Ramotion/paper-onboarding.git`,
    },
    animationPhysics: 'Expanding CAShapeLayer circular mask from indicator origin + vertical text drift',
    easingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    swiftCode: `import paper_onboarding

class OnboardingVC: UIViewController, PaperOnboardingDataSource {
    func onboardingItemsCount() -> Int { return 3 }

    func onboardingItem(at index: Int) -> OnboardingItemInfo {
        return OnboardingItemInfo(
            informationImage: UIImage(named: "icon_\\(index)")!,
            title: "Motion Step \\(index + 1)",
            description: "Fluid onboarding with radial fill transitions.",
            pageIcon: UIImage(named: "dot")!,
            color: UIColor.systemIndigo,
            titleColor: .white,
            descriptionColor: .white,
            titleFont: .boldSystemFont(ofSize: 24),
            descriptionFont: .systemFont(ofSize: 15)
        )
    }
}`,
  },
  {
    id: 'cardslider',
    number: 5,
    name: 'CardSlider',
    slug: 'cardslider',
    category: 'Carousels & Feeds',
    tagline: 'Stacked 3D swipeable picture card deck',
    description: 'UI controller allowing users to swipe smoothly through stacked cards with parallax depth offsets and spring snap-back.',
    repoUrl: 'https://github.com/Ramotion/cardslider',
    installGuideUrl: 'https://github.com/Ramotion/cardslider#installation',
    requirementsUrl: 'https://github.com/Ramotion/cardslider#requirements',
    gifRef: 'iOS_Card_Slider.gif',
    requirements: { ios: 'iOS 11.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'CardSlider'`,
      carthage: `github "Ramotion/cardslider"`,
      spm: `https://github.com/Ramotion/cardslider.git`,
    },
    animationPhysics: 'Stacked Z-depth scaling (0.92, 0.84) + gesture velocity translation',
    easingCurve: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
    swiftCode: `import CardSlider

struct SliderCard: CardSliderItem {
    var image: UIImage
    var rating: Int?
    var title: String
    var subtitle: String?
    var description: String?
}

let vc = CardSliderViewController.with(dataSource: self)
vc.title = "Featured Animation Modules"
present(vc, animated: true)`,
  },
  {
    id: 'navigation-toolbar',
    number: 6,
    name: 'Navigation Toolbar',
    slug: 'navigation-toolbar',
    category: 'Navigation',
    tagline: 'Slide-modeled expandable top navigation controller',
    description: 'A Swift slide-modeled UI navigation controller that animates top bar actions and contextual drawer headers cleanly.',
    repoUrl: 'https://github.com/Ramotion/navigation-toolbar',
    installGuideUrl: 'https://github.com/Ramotion/navigation-toolbar#installation',
    requirementsUrl: 'https://github.com/Ramotion/navigation-toolbar#requirements',
    gifRef: 'iOS-Navigation-Toolbar-1x.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'NavigationToolbar'`,
      carthage: `github "Ramotion/navigation-toolbar"`,
      spm: `https://github.com/Ramotion/navigation-toolbar.git`,
    },
    animationPhysics: 'Synchronized header height & horizontal slide momentum transition',
    easingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    swiftCode: `import NavigationToolbar

class ToolbarDemoController: UIViewController {
    let navToolbar = NavigationToolbarView()
    func configureToolbar() {
        navToolbar.items = ["Overview", "Charts", "Physics", "Export"]
        navToolbar.animateSelection(toIndex: 1)
    }
}`,
  },
  {
    id: 'expanding-collection',
    number: 7,
    name: 'Expanding Collection',
    slug: 'expanding-collection',
    category: 'Cards & Lists',
    tagline: 'Material design UI card peek and pop controller',
    description: 'An animated material design UI card peek/pop controller where tapping the front card separates header & body layers into an expanded detail view.',
    repoUrl: 'https://github.com/Ramotion/expanding-collection',
    installGuideUrl: 'https://github.com/Ramotion/expanding-collection#installation',
    requirementsUrl: 'https://github.com/Ramotion/expanding-collection#requirements',
    gifRef: 'gifs/expanding-collection-edited.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'expanding-collection'`,
      carthage: `github "Ramotion/expanding-collection"`,
      spm: `https://github.com/Ramotion/expanding-collection.git`,
    },
    animationPhysics: 'Dual-layer Y-offset separation (front cover lifts -24px while backdrop expands)',
    easingCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    swiftCode: `import expanding_collection

class DemoExpandingVC: ExpandingViewController {
    override func viewDidLoad() {
        itemSize = CGSize(width: 256, height: 335)
        super.viewDidLoad()
    }
    func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
        let cell = collectionView.cellForItem(at: indexPath) as? BasePageCollectionCell
        cell?.cellIsOpen(!cell!.isOpened, animated: true)
    }
}`,
  },
  {
    id: 'circle-menu',
    number: 8,
    name: 'Circle Menu',
    slug: 'circle-menu',
    category: 'Controls & Switches',
    tagline: 'Radial polar-coordinate expanding action menu',
    description: 'A simple, elegant UI menu with a circular layout and material design ripple & elastic spring animations.',
    repoUrl: 'https://github.com/Ramotion/circle-menu',
    installGuideUrl: 'https://github.com/Ramotion/circle-menu#installation',
    requirementsUrl: 'https://github.com/Ramotion/circle-menu#requirements',
    gifRef: 'gifs/circle-menu-edited.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'CircleMenu'`,
      carthage: `github "Ramotion/circle-menu"`,
      spm: `https://github.com/Ramotion/circle-menu.git`,
    },
    animationPhysics: 'Polar coordinate arc deployment (r·cosθ, r·sinθ) with staggered 40ms spring delay',
    easingCurve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    swiftCode: `import CircleMenu

let button = CircleMenu(
    frame: CGRect(x: 160, y: 300, width: 56, height: 56),
    normalIcon: "icon_menu",
    selectedIcon: "icon_close",
    buttonsCount: 5,
    duration: 0.45,
    distance: 120
)
button.delegate = self
view.addSubview(button)`,
  },
  {
    id: 'paper-switch',
    number: 9,
    name: 'Paper Switch',
    slug: 'paper-switch',
    category: 'Controls & Switches',
    tagline: 'Material switch that paints over parent view',
    description: 'A Swift material design RAMPaperSwitch module that radiates a smooth color-fill wave across its parent container when toggled on.',
    repoUrl: 'https://github.com/Ramotion/paper-switch',
    installGuideUrl: 'https://github.com/Ramotion/paper-switch#installation',
    requirementsUrl: 'https://github.com/Ramotion/paper-switch#requirements',
    gifRef: 'gifs/paper-switch.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'RAMPaperSwitch'`,
      carthage: `github "Ramotion/paper-switch"`,
      spm: `https://github.com/Ramotion/paper-switch.git`,
    },
    animationPhysics: 'Radial circle expansion (scale 0 → 30x) anchored to thumb center coordinates',
    easingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    swiftCode: `import RAMPaperSwitch

@IBOutlet weak var paperSwitch: RAMPaperSwitch!

override func viewDidLoad() {
    super.viewDidLoad()
    paperSwitch.duration = 0.45
    paperSwitch.animationDidStartClosure = { onAnimation in
        print("Parent background flood started: \\(onAnimation)")
    }
}`,
  },
  {
    id: 'reel-search',
    number: 10,
    name: 'Reel Search',
    slug: 'reel-search',
    category: 'Controls & Switches',
    tagline: '3D curved slot-reel list search & option picker',
    description: 'Reel Search is a Swift UI controller that lets users search and pick options from a rotating cylindrical list with perspective fade.',
    repoUrl: 'https://github.com/Ramotion/reel-search',
    installGuideUrl: 'https://github.com/Ramotion/reel-search#installation',
    requirementsUrl: 'https://github.com/Ramotion/reel-search#requirements',
    gifRef: 'gifs/reel-search.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'RAMReel'`,
      carthage: `github "Ramotion/reel-search"`,
      spm: `https://github.com/Ramotion/reel-search.git`,
    },
    animationPhysics: 'Live query filter + cylindrical vertical wheel damping & alpha falloff',
    easingCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    swiftCode: `import RAMReel

var dataSource = SimplePrefixQueryDataSource(["Line Chart", "Radar Plot", "Candlestick", "Heatmap", "Folding Cell"])
let reel = RAMReel(frame: view.bounds, dataSource: dataSource, placeholder: "Search Component...") { selected in
    print("Selected:", selected)
}
view.addSubview(reel.view)`,
  },
  {
    id: 'navigation-stack',
    number: 11,
    name: 'Navigation Stack',
    slug: 'navigation-stack',
    category: 'Navigation',
    tagline: '3D depth-layered UINavigationController stack',
    description: 'Navigation Stack models view controller hierarchy as physical stacked cards that tilt and reveal layered screens during pop gestures.',
    repoUrl: 'https://github.com/Ramotion/navigation-stack',
    installGuideUrl: 'https://github.com/Ramotion/navigation-stack#installation',
    requirementsUrl: 'https://github.com/Ramotion/navigation-stack#requirements',
    gifRef: 'gifs/navigation-stack.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'Navigation-stack'`,
      carthage: `github "Ramotion/navigation-stack"`,
      spm: `https://github.com/Ramotion/navigation-stack.git`,
    },
    animationPhysics: 'Layered Z-stack compression (translateY + scale 0.94..0.82) during stack overview',
    easingCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    swiftCode: `import Navigation_stack

class StackRootController: NavigationStack {
    func showPreviousScreens() {
        showControllers()
    }
}`,
  },
  {
    id: 'adaptive-tab-bar',
    number: 12,
    name: 'Adaptive Tab Bar',
    slug: 'adaptive-tab-bar',
    category: 'Navigation',
    tagline: 'Progressive reduction adaptive UI state engine',
    description: 'Progressive Reduction module that adapts tab bar density and text labels over time based on user familiarity and engagement counts.',
    repoUrl: 'https://github.com/Ramotion/adaptive-tab-bar',
    installGuideUrl: 'https://github.com/Ramotion/adaptive-tab-bar#installation',
    requirementsUrl: 'https://github.com/Ramotion/adaptive-tab-bar#requirements',
    gifRef: 'gifs/adaptive-tab-bar.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'AdaptiveController'`,
      carthage: `github "Ramotion/adaptive-tab-bar"`,
      spm: `https://github.com/Ramotion/adaptive-tab-bar.git`,
    },
    animationPhysics: 'Progressive UI state morphing: Novice (Label+Icon) → Intermediate → Expert (Icon-only)',
    easingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    swiftCode: `import AdaptiveController

let states: [AdaptiveState] = [NoviceState(), FamiliarState(), ExpertState()]
let adaptiveController = AdaptiveButtonsStateManager(states: states, currentCount: 42)`,
  },
  {
    id: 'preview-transition',
    number: 13,
    name: 'Preview Transition',
    slug: 'preview-transition',
    category: 'Onboarding & Media',
    tagline: 'Parallax gallery card to full-screen transition',
    description: 'Preview Transition is a simple preview gallery UI controller with synchronized hero image parallax and title morph transitions.',
    repoUrl: 'https://github.com/Ramotion/preview-transition',
    installGuideUrl: 'https://github.com/Ramotion/preview-transition#installation',
    requirementsUrl: 'https://github.com/Ramotion/preview-transition#requirements',
    gifRef: 'gifs/preview-transition.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'PreviewTransition'`,
      carthage: `github "Ramotion/preview-transition"`,
      spm: `https://github.com/Ramotion/preview-transition.git`,
    },
    animationPhysics: 'Shared-element frame interpolation + vertical scroll parallax factor',
    easingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    swiftCode: `import PreviewTransition

class GalleryTableVC: PTTableViewController {
    override func tableView(_ tableView: UITableView, didSelectRowAt indexPath: IndexPath) {
        let detailVC = DetailViewController()
        pushViewController(detailVC)
    }
}`,
  },
  {
    id: 'gliding-collection',
    number: 14,
    name: 'Gliding Collection',
    slug: 'gliding-collection',
    category: 'Carousels & Feeds',
    tagline: 'Flowing UICollectionView vertical-horizontal glide',
    description: 'A smooth, flowing, customizable UICollectionView Swift controller linking vertical category headers to horizontal card gliding.',
    repoUrl: 'https://github.com/Ramotion/gliding-collection',
    installGuideUrl: 'https://github.com/Ramotion/gliding-collection#installation',
    requirementsUrl: 'https://github.com/Ramotion/gliding-collection#requirements',
    gifRef: 'gifs/gliding_collection.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'GlidingCollection'`,
      carthage: `github "Ramotion/gliding-collection"`,
      spm: `https://github.com/Ramotion/gliding-collection.git`,
    },
    animationPhysics: 'Cross-axis inertia glide: vertical header lock triggers horizontal card slide-in',
    easingCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    swiftCode: `import GlidingCollection

class GlidingDemoVC: UIViewController, GlidingCollectionDatasource {
    @IBOutlet weak var glidingView: GlidingCollection!
    override func viewDidLoad() {
        glidingView.dataSource = self
        glidingView.expandedItemIndex = 0
    }
}`,
  },
  {
    id: 'fluid-slider',
    number: 15,
    name: 'Fluid Slider',
    slug: 'fluid-slider',
    category: 'Controls & Switches',
    tagline: 'Liquid pop-up bubble precision value slider',
    description: 'A slider widget with a fluid metaball-style pop-up bubble displaying the precise selected numeric value in real time.',
    repoUrl: 'https://github.com/Ramotion/fluid-slider',
    installGuideUrl: 'https://github.com/Ramotion/fluid-slider#installation',
    requirementsUrl: 'https://github.com/Ramotion/fluid-slider#requirements',
    gifRef: 'gifs/fluid-slider-edited.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'fluid-slider'`,
      carthage: `github "Ramotion/fluid-slider"`,
      spm: `https://github.com/Ramotion/fluid-slider.git`,
    },
    animationPhysics: 'Bezier neck metaball stretch + drag velocity bubble tilt (-12° to +12°)',
    easingCurve: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    swiftCode: `import fluid_slider

let slider = Slider()
slider.attributedTextForFraction = { fraction in
    let value = Int(fraction * 100)
    return NSAttributedString(string: "\\(value)%")
}
slider.contentViewColor = UIColor.systemBlue
slider.valueViewColor = .white`,
  },
  {
    id: 'elongation-preview',
    number: 16,
    name: 'Elongation Preview',
    slug: 'elongation-preview',
    category: 'Cards & Lists',
    tagline: 'Elongating push-pop list-to-detail view controller',
    description: 'Elongation Preview is an elegant UI push-pop style view controller where a compact card elongates smoothly into an expanded vertical detail sheet.',
    repoUrl: 'https://github.com/Ramotion/elongation-preview',
    installGuideUrl: 'https://github.com/Ramotion/elongation-preview#installation',
    requirementsUrl: 'https://github.com/Ramotion/elongation-preview#requirements',
    gifRef: 'gifs/elongation-preview-edited.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'ElongationPreview'`,
      carthage: `github "Ramotion/elongation-preview"`,
      spm: `https://github.com/Ramotion/elongation-preview.git`,
    },
    animationPhysics: 'Vertical container expansion + decoupled top/bottom card split reveal',
    easingCurve: 'cubic-bezier(0.16, 1, 0.3, 1)',
    swiftCode: `import ElongationPreview

class ElongationDemoVC: ElongationViewController {
    override func openDetailView(for indexPath: IndexPath) {
        let detailVC = ElongationDetailViewController()
        expand(viewController: detailVC)
    }
}`,
  },
  {
    id: 'garland-view',
    number: 17,
    name: 'Garland View',
    slug: 'garland-view',
    category: 'Carousels & Feeds',
    tagline: 'Curved multi-stream content list switcher',
    description: 'Garland View seamlessly transitions horizontally between multiple vertical content lists along an arc trajectory.',
    repoUrl: 'https://github.com/Ramotion/garland-view',
    installGuideUrl: 'https://github.com/Ramotion/garland-view#installation',
    requirementsUrl: 'https://github.com/Ramotion/garland-view#requirements',
    gifRef: 'gifs/garland-view.gif',
    requirements: { ios: 'iOS 10.0+', swift: 'Swift 5.0+', xcode: 'Xcode 11+' },
    installation: {
      cocoapods: `pod 'GarlandView'`,
      carthage: `github "Ramotion/garland-view"`,
      spm: `https://github.com/Ramotion/garland-view.git`,
    },
    animationPhysics: 'Parabolic arc horizontal header transition synced with vertical collection reload',
    easingCurve: 'cubic-bezier(0.22, 1, 0.36, 1)',
    swiftCode: `import GarlandView

class GarlandCollectionVC: GarlandViewController {
    override func viewDidLoad() {
        super.viewDidLoad()
        GarlandConfig.shared.animationDuration = 0.45
    }
}`,
  },
];

export const ANIMATION_COURSE_ZIP_PACKS: ZipPackMeta[] = [
  {
    id: 'master-pack',
    filename: 'swift-ui-animation-components-master-pack.zip',
    downloadUrl: '/downloads/animation-course/swift-ui-animation-components-master-pack.zip',
    title: 'Complete Master Course Archive (Everything Included)',
    subtitle: 'All 17 Swift UI animation components, all 12 animated graphs & charts, Swift + React/SVG source code, and Ramotion repo files',
    sizeLabel: '31 KB',
    fileCount: 34,
    badge: 'All-In-One ZIP',
    contents: [
      'README.md, AppDelegate.swift, LICENSE, header.png (Ramotion Repo)',
      '17 Swift UI Animation Component Modules (.swift + Podfile + Package.swift)',
      '12 Animated Charts & Graphs Implementations (Swift Charts + SVG/React)',
      'Spring Physics, Bezier Easing & Motion Curves Reference',
    ],
  },
  {
    id: 'ramotion-repo',
    filename: '01-ramotion-swift-ui-repo-files.zip',
    downloadUrl: '/downloads/animation-course/01-ramotion-swift-ui-repo-files.zip',
    title: '01. Ramotion Original Repository Files',
    subtitle: 'Direct source archive from github.com/Ramotion/swift-ui-animation-components-and-libraries',
    sizeLabel: '20 KB',
    fileCount: 5,
    badge: 'GitHub Repo',
    contents: ['README.md', 'AppDelegate.swift', 'LICENSE', '.gitignore', 'header.png'],
  },
  {
    id: 'swift-components',
    filename: '02-swift-ui-17-components-kit.zip',
    downloadUrl: '/downloads/animation-course/02-swift-ui-17-components-kit.zip',
    title: '02. 17 Swift UI Animation Components Kit',
    subtitle: 'CocoaPods, Carthage, Swift Package Manager configs and controller starter code for all 17 components',
    sizeLabel: '6.4 KB',
    fileCount: 19,
    badge: '17 Modules',
    contents: [
      'CircularCarousel.swift, FoldingCell.swift, AnimatedTabBar.swift, PaperOnboarding.swift',
      'CircleMenu.swift, PaperSwitch.swift, FluidSlider.swift, GarlandView.swift + 9 more',
      'Podfile & Package.swift dependency manifests',
    ],
  },
  {
    id: 'charts-graphs',
    filename: '03-animated-graphs-and-charts-pack.zip',
    downloadUrl: '/downloads/animation-course/03-animated-graphs-and-charts-pack.zip',
    title: '03. All Types of Graphs & Charts Animation Pack',
    subtitle: 'Line, Area, Bar, Pie/Donut, Radial Gauge, Radar, Scatter, Candlestick, Heatmap, Funnel, Treemap & Live Waveform',
    sizeLabel: '2.5 KB',
    fileCount: 5,
    badge: '12 Chart Types',
    contents: [
      'LineAndAreaCharts.swift & BarAndStackedCharts.swift',
      'PieDonutAndRadialRings.swift & RadarScatterHeatmapCandlestickFunnelTreemap.swift',
      'WebChartsReadme.md implementation guide',
    ],
  },
  {
    id: 'motion-physics',
    filename: '04-motion-physics-and-transitions-pack.zip',
    downloadUrl: '/downloads/animation-course/04-motion-physics-and-transitions-pack.zip',
    title: '04. Spring Physics & Motion Curves Lab Pack',
    subtitle: 'Damped spring solver, cubic-bezier timeline interpolator, and UIViewPropertyAnimator / CSS compositor recipes',
    sizeLabel: '1.5 KB',
    fileCount: 4,
    badge: 'Physics Engine',
    contents: [
      'SpringSolver.swift & SpringSolver.ts',
      'CubicBezierTimingCurves.swift',
      'InteractiveGestureTransitions.md',
    ],
  },
];

export const ARCHIVE_PREVIEW_FILES: ArchivePreviewFile[] = [
  {
    path: 'README.md',
    folder: 'Ramotion Repo Root',
    language: 'markdown',
    description: 'Curated index of all 17 Swift UI Animation Components & Libraries by Ramotion',
    content: RAMOTION_ORIGINAL_README,
  },
  {
    path: 'AppDelegate.swift',
    folder: 'Ramotion Repo Root',
    language: 'swift',
    description: 'Original iOS UIApplicationDelegate entry point from the repository',
    content: RAMOTION_APP_DELEGATE_SWIFT,
  },
  {
    path: 'LICENSE',
    folder: 'Ramotion Repo Root',
    language: 'text',
    description: 'MIT License governing the Swift UI animation libraries',
    content: RAMOTION_LICENSE,
  },
  {
    path: 'charts-and-graphs/AnimatedChartsSuite.swift',
    folder: 'Charts & Graphs Pack',
    language: 'swift',
    description: 'Swift Charts + CoreAnimation spring-animated Line, Bar, Pie, Radar, Candlestick & Heatmap templates',
    content: `import SwiftUI
import Charts

struct MetricPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
    let category: String
}

struct AnimatedLineBarChartView: View {
    @State private var animateProgress: CGFloat = 0
    let data: [MetricPoint]

    var body: some View {
        Chart(data) { item in
            BarMark(
                x: .value("Period", item.label),
                y: .value("Value", item.value * animateProgress)
            )
            .foregroundStyle(.cyan.gradient)
            .cornerRadius(6)
        }
        .onAppear {
            withAnimation(.spring(response: 0.75, dampingFraction: 0.72)) {
                animateProgress = 1.0
            }
        }
    }
}`,
  },
  {
    path: 'swift-components/Package.swift',
    folder: 'Swift Components Kit',
    language: 'swift',
    description: 'Swift Package Manager manifest bundling the Ramotion UI animation libraries',
    content: `// swift-tools-version:5.5
import PackageDescription

let package = Package(
    name: "OpenFrameSwiftUIAnimationCourse",
    platforms: [.iOS(.v13)],
    dependencies: [
        .package(url: "https://github.com/Ramotion/folding-cell.git", from: "5.0.0"),
        .package(url: "https://github.com/Ramotion/animated-tab-bar.git", from: "5.2.0"),
        .package(url: "https://github.com/Ramotion/paper-onboarding.git", from: "6.1.0"),
        .package(url: "https://github.com/Ramotion/circle-menu.git", from: "4.1.0"),
        .package(url: "https://github.com/Ramotion/paper-switch.git", from: "4.0.0"),
        .package(url: "https://github.com/Ramotion/fluid-slider.git", from: "1.1.0"),
        .package(url: "https://github.com/Ramotion/expanding-collection.git", from: "4.0.0"),
        .package(url: "https://github.com/Ramotion/circular-carousel.git", from: "1.0.0"),
    ],
    targets: [
        .target(name: "AnimationCourseApp", dependencies: [])
    ]
)`,
  },
  {
    path: 'motion-physics/SpringSolver.ts',
    folder: 'Motion Physics Pack',
    language: 'typescript',
    description: 'Harmonic damped spring physics solver for 60fps chart & UI transitions',
    content: `export interface SpringConfig {
  stiffness: number; // e.g., 180
  damping: number;   // e.g., 16
  mass: number;      // e.g., 1
}

export function sampleSpringCurve(config: SpringConfig, steps = 60): number[] {
  const { stiffness, damping, mass } = config;
  const dt = 1 / 60;
  let position = 0;
  let velocity = 0;
  const target = 1;
  const samples: number[] = [];

  for (let i = 0; i < steps; i++) {
    const force = -stiffness * (position - target);
    const damper = -damping * velocity;
    const accel = (force + damper) / mass;
    velocity += accel * dt;
    position += velocity * dt;
    samples.push(position);
  }
  return samples;
}`,
  },
];
