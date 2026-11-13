# Northgo website

The static site is generated from the files in `build/`:

```powershell
node build/generate.mjs
```

Serve `site/` through a local HTTP server when previewing the generated pages.

## Third-party map data and licenses

`site/assets/world-pacific.svg` is derived from **Natural Earth 1:110m Admin 0 – Countries**:

- Source: https://www.naturalearthdata.com/downloads/110m-cultural-vectors/110m-admin-0-countries/
- Upstream vector repository: https://github.com/nvkelso/natural-earth-vector
- License: Natural Earth data is in the public domain and may be used commercially. See https://www.naturalearthdata.com/about/terms-of-use/

The source country geometry was converted to a Pacific-centered equirectangular SVG and simplified to the precision used by the website. The website does not use Google Maps as a basemap or call the Google Maps API; office-detail links may open the public Google Maps website.
