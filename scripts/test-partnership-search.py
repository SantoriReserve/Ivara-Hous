#!/usr/bin/env python3
"""Verify partnership search matching for major cities (mirrors TS geo logic)."""
import json, re, pathlib, unicodedata

def slugify(value):
    value = value.lower().strip()
    value = unicodedata.normalize('NFD', value)
    value = ''.join(c for c in value if unicodedata.category(c) != 'Mn')
    value = re.sub(r'[^a-z0-9]+', '-', value).strip('-')
    return value

CITY_ALIASES = {
  'nyc': 'new-york-city', 'new york': 'new-york-city', 'new york city': 'new-york-city',
  'manhattan': 'new-york-city', 'brooklyn': 'new-york-city',
  'los angeles': 'los-angeles', 'la': 'los-angeles', 'san francisco': 'san-francisco', 'sf': 'san-francisco',
  'miami beach': 'miami', 'south beach': 'miami', 'barcelona': 'barcelona', 'madrid': 'madrid', 'toronto': 'toronto',
  'mexico city': 'mexico-city', 'cdmx': 'mexico-city', 'cape town': 'cape-town', 'capetown': 'cape-town',
}
HYPHEN = {'new-york':'new-york-city','south-beach':'miami','miami-beach':'miami','la':'los-angeles','sf':'san-francisco','nyc':'new-york-city','cdmx':'mexico-city','capetown':'cape-town','praha':'prague'}
STATE_ALIASES = {'fl':'florida','ny':'new-york','ca':'california'}
COUNTRY_ALIASES = {'usa':'united-states','us':'united-states','united states':'united-states','uk':'united-kingdom','england':'united-kingdom','uae':'united-arab-emirates'}
SUPPORTED = {'miami','new-york-city','los-angeles','san-francisco','chicago','london','paris','barcelona','rome','lisbon','dubai','cape-town','tulum','mexico-city','bali','bangkok','sydney','toronto','tokyo','amsterdam','singapore','prague','madrid'}

def resolve_city_key(raw):
    if not raw: return ''
    if raw in CITY_ALIASES: return CITY_ALIASES[raw]
    if raw in HYPHEN: return HYPHEN[raw]
    spaced = raw.replace('-', ' ')
    if spaced in CITY_ALIASES: return CITY_ALIASES[spaced]
    if raw in SUPPORTED: return raw
    return raw

def resolve_geo(city, state, country):
    raw_city, raw_state, raw_country = slugify(city), slugify(state), slugify(country)
    c = resolve_city_key(raw_city)
    s = STATE_ALIASES.get(raw_state, raw_state)
    co = COUNTRY_ALIASES.get(raw_country, raw_country)
    if not c and raw_state:
        sc = resolve_city_key(raw_state)
        if sc in SUPPORTED:
            c, s = sc, ''
    return c, s, co

def matches(business, search):
    c, s, co = search
    has_c, has_s, has_co = bool(c), bool(s), bool(co)
    if has_c:
        if business['city'] != c: return False
        if has_s and business['state'] != s: return False
        if has_co and business['country'] != co: return False
        return True
    if has_s:
        if business['state'] != s: return False
        if has_co and business['country'] != co: return False
        return True
    if has_co:
        return business['country'] == co
    return False

text = pathlib.Path('src/lib/dashboard/partnership-directory-raw.ts').read_text()
marker = 'export const RAW_PARTNERSHIP_ENTRIES: RawPartnershipEntry[] = '
start = text.index(marker) + len(marker)
entries = json.loads(text[start:text.rindex(']')+1])

searches = [
    ('New York', 'New York', 'United States'),
    ('New York', '', ''),
    ('Miami', 'Florida', 'United States'),
    ('Los Angeles', 'California', 'United States'),
    ('London', '', 'United Kingdom'),
    ('Paris', '', 'France'),
    ('Barcelona', '', 'Spain'),
]

print('=== Partnership Search Verification ===\n')
for city, state, country in searches:
    geo = resolve_geo(city, state, country)
    matched = [e for e in entries if matches(e, geo)]
    print(f"Search: {city}, {state}, {country}")
    print(f"  Resolved: city={geo[0]!r} state={geo[1]!r} country={geo[2]!r}")
    print(f"  Matches: {len(matched)}")
    for e in matched[:8]:
        print(f"    - {e['businessName']} ({e['category']})")
    if len(matched) > 8:
        print(f"    ... +{len(matched)-8} more")
    print()
