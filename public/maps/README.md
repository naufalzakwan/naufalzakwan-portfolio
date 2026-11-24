# Origin globe map sources

`origin-boundaries.json` contains simplified geographic linework, not map tiles.

- World countries: [Natural Earth 1:110m](https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_110m_admin_0_countries.geojson), public domain.
- Indonesian provinces, including West Kalimantan (`ID-KB`): [geoBoundaries IDN ADM1](https://www.geoboundaries.org/api/current/gbOpen/IDN/ADM1/), release `9469f09`, representing 2017 boundaries. Original source: © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), via Wambacher / geoBoundaries.
- The derived line database and `pontianak.svg` are made available under [Open Database License 1.0](https://opendatacommons.org/licenses/odbl/1-0/). SVG cartographic linework is derived from this database.

Coordinates remain longitude/latitude degrees. The browser uses an orthographic sphere projection; the birthplace marker uses the owner's supplied coordinate, longitude `109.3425`, latitude `-0.0263`. These are illustrative, simplified boundaries, not a street map or surveying product.

Rebuild from the source URLs with `node scripts/prepare-origin-map.mjs`. Optionally pass a local cache directory containing `world.geojson` and `indonesia-adm1.geojson`. Simplification tolerances (in degrees) are defined in that script. All rendered map assets are served locally; visitors make no requests to third-party map providers.
