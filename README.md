# 🗺️ Offline Maps PWA

A Progressive Web App (PWA) that provides offline map functionality using Leaflet.js with support for polygons and markers.

## ✨ Features



- **Offline Map Support**: View maps even when offline using cached tiles
- **Interactive Polygons**: Display and interact with polygon areas on the map
- **Custom Markers**: Add and manage location markers with popup information
- **PWA Functionality**: Install as a native app on mobile and desktop devices
- **Responsive Design**: Works seamlessly across all device sizes
- **Real-time Status**: Shows online/offline status and tile caching information

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd offline-maps-pwa
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
```

## 📱 PWA Installation

### Desktop
1. Open the app in Chrome/Edge
2. Click the install icon in the address bar
3. Follow the installation prompts

### Mobile
1. Open the app in Chrome/Safari
2. Tap the "Add to Home Screen" option
3. The app will be installed as a native app

## 🗺️ Map Features

### Default Map Content
The app comes with sample data for New York City:
- **Downtown Area**: Red polygon representing the financial district
- **Midtown Area**: Blue polygon representing the shopping district
- **Times Square**: Marker for the famous intersection
- **Penn Station**: Marker for the transportation hub

### Customizing the Map
You can customize the map by passing features to the `OfflineMap` component:

```tsx
const customFeatures = [
  {
    id: 'custom-area',
    type: 'polygon',
    coordinates: [[lat1, lng1], [lat2, lng2], [lat3, lng3]],
    properties: {
      name: 'Custom Area',
      description: 'Description of the area',
      color: 'green',
      fillColor: '#0f0',
      fillOpacity: 0.4
    }
  },
  {
    id: 'custom-marker',
    type: 'marker',
    coordinates: [lat, lng],
    properties: {
      name: 'Custom Location',
      description: 'Description of the location'
    }
  }
];

<OfflineMap features={customFeatures} />
```

## 🔧 Technical Details

### Service Worker
- Caches app resources for offline functionality
- Handles tile caching for map data
- Provides update notifications

### Offline Support
- Map tiles are cached as they're loaded
- App works completely offline after initial load
- Automatic fallback to cached content

### Map Controls
- **Zoom**: Standard zoom in/out controls
- **Scale**: Distance scale indicator
- **Fullscreen**: Toggle fullscreen mode
- **Layer Control**: Toggle visibility of polygons and markers

## 🎨 Customization

### Styling
The app uses CSS custom properties and can be easily themed by modifying:
- `src/App.css` - Main application styles
- Component-specific styles in each component file

### Map Configuration
Modify map settings in `src/components/OfflineMap.tsx`:
- Default center coordinates
- Default zoom level
- Tile layer sources
- Control positions

## 📱 Browser Support

- Chrome 67+
- Firefox 60+
- Safari 11.1+
- Edge 79+

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Leaflet.js](https://leafletjs.com/) - Open-source mapping library
- [OpenStreetMap](https://www.openstreetmap.org/) - Free map data
- [React](https://reactjs.org/) - UI library
- [PWA](https://web.dev/progressive-web-apps/) - Progressive Web App standards

## 📞 Support

For questions or issues, please open a GitHub issue or contact the development team.
