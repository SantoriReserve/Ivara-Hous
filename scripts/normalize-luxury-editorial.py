#!/usr/bin/env python3
"""Move luxury-editorial assets to clean URL-safe filenames."""
import os
import shutil

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "luxury-editorial")
SRC = os.path.join(ROOT, ":public:dashboard-assets")

RENAME_MAP = {
    "(9) Instagram.jpeg": "resort-villa-pool-tuscany.jpeg",
    "Amanzoe _ A pool with a view_ The silhouette of the Peloponnesian hills and the sapphire blue of the Aegean disappearing into the horizon from the… _ Instagram.jpeg": "property-amanzoe-pool.jpeg",
    "Designed for the moments that matter_ __Soft seating that adapts, _Comfort that lasts. __Designed by @studiosegers __#outdoorreimagined #outdoor #outdoorfurniture #roolfliving #outdoorluxury": "villa-terrace-mediterranean.jpeg",
    "Elegant patio with ocean view, a Photo by Beautiful things.jpeg": "villa-ocean-arch-terrace.jpeg",
    "Elevated Day Lounger.jpeg": "resort-pool-loungers-editorial.jpeg",
    "Some stills from @mastrojanni1975 🌞__#tuscany #tuscanygram #tuscanyitaly.jpeg": "dining-poolside-lifestyle.jpeg",
    "Summer Essentials Be_ 🌊🖤_últimos dias.__#SummerEssentials #BasicaeEstilosa #Basic": "resort-infinity-palm.jpeg",
    "TRAVELINKA ▲ GO.jpeg": "resort-pool-olive-luxury.jpeg",
    "Work time.jpeg": "creator-workspace-ocean.jpeg",
    "Yarch 🛥️.jpeg": "yacht-aerial-luxury.jpeg",
    "_ - 2026-06-20T141500.833.jpeg": "content-creator-santorini-hat.jpeg",
    "_ - 2026-06-20T141519.417.jpeg": "villa-coastal-terrace-chairs.jpeg",
    "_ - 2026-06-20T141524.437.jpeg": "villa-santorini-wicker-terrace.jpeg",
    "_ - 2026-06-20T141527.701.jpeg": "villa-santorini-caldera-chairs.jpeg",
    "_ - 2026-06-20T141537.258.jpeg": "resort-cliffside-loungers.jpeg",
    "_ - 2026-06-20T141549.593.jpeg": "hotel-riviera-architecture.jpeg",
    "_ - 2026-06-20T141558.341.jpeg": "resort-coastal-jetski-view.jpeg",
    "_ - 2026-06-20T141621.318.jpeg": "cafe-espresso-terrace-sea.jpeg",
    "_ - 2026-06-20T141716.874.jpeg": "resort-terrace-yacht-view.jpeg",
    "_ - 2026-06-20T141757.731.jpeg": "dining-breakfast-infinity-pool.jpeg",
    "_ - 2026-06-20T141807.342.jpeg": "resort-infinity-pool-twilight.jpeg",
    "_ - 2026-06-20T141832.768.jpeg": "dining-breakfast-pool-tray.jpeg",
    "_ - 2026-06-20T141845.987.jpeg": "villa-lake-como-lounge.jpeg",
    "_ - 2026-06-20T141905.826.jpeg": "villa-coastal-arch-window.jpeg",
    "_ - 2026-06-20T141915.274.jpeg": "yacht-lifestyle-tennis.jpeg",
    "_ - 2026-06-20T141929.726.jpeg": "yacht-champagne-luxury.jpeg",
    "_ - 2026-06-20T141957.939.jpeg": "villa-coastal-stone-arch.jpeg",
    "_ - 2026-06-20T142055.763.jpeg": "strategy-luxury-yacht-sunset.jpeg",
    "_ - 2026-06-20T142138.008.jpeg": "villa-luxury-bathroom-ocean.jpeg",
    "_ - 2026-06-20T142145.602.jpeg": "resort-olive-grove-pool.jpeg",
    "_ - 2026-06-20T142232.617.jpeg": "villa-infinity-pool-lifestyle.jpeg",
    "_ - 2026-06-20T142239.652.jpeg": "content-creator-pool-editorial.jpeg",
    "_ - 2026-06-20T142250.147.jpeg": "content-editorial-oversized-hat.jpeg",
    "_ - 2026-06-20T142332.168.jpeg": "villa-ocean-living-editorial.jpeg",
    "_ - 2026-06-20T142338.699.jpeg": "hotel-beach-cabana-daybeds.jpeg",
    "_ - 2026-06-20T142345.468.jpeg": "resort-beach-club-loungers.jpeg",
    "_ - 2026-06-20T142411.309.jpeg": "resort-minimalist-patio-pool.jpeg",
    "_ - 2026-06-20T142512.073.jpeg": "resort-thatched-umbrella-pool.jpeg",
    "_ - 2026-06-20T142643.108.jpeg": "creator-reading-terrace-sunset.jpeg",
    "_ - 2026-06-20T142710.083.jpeg": "resort-pool-evening-wine.jpeg",
}

def main() -> None:
    if not os.path.isdir(SRC):
        print(f"Source folder missing: {SRC}")
        return

    mapped = set(RENAME_MAP.keys())
    for filename in os.listdir(SRC):
        if filename.startswith("."):
            continue
        dest = RENAME_MAP.get(filename)
        if not dest and "Mykonos" in filename:
            dest = "hotel-boutique-mykonos.jpeg"
        if not dest:
            raise SystemExit(f"No rename mapping for: {filename!r}")
        src_path = os.path.join(SRC, filename)
        dest_path = os.path.join(ROOT, dest)
        shutil.copy2(src_path, dest_path)
        print(f"  {dest}")

    leftover = [f for f in os.listdir(SRC) if not f.startswith(".")]
    if len(leftover) != len(RENAME_MAP) and not any("Mykonos" in f for f in leftover):
        unmapped = [f for f in leftover if f not in mapped and "Mykonos" not in f]
        if unmapped:
            raise SystemExit(f"Unmapped files remain: {unmapped}")

    print(f"\nNormalized {len(os.listdir(ROOT)) - 1} assets into {ROOT}")

if __name__ == "__main__":
    main()
