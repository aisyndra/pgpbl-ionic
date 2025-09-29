import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';

const iconDefault = L.icon({
  iconUrl: 'assets/marker-icon.png',
  shadowUrl: 'assets/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {

  private dataService = inject(DataService);

  async loadPoints() {
    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
        const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
        marker.bindPopup(`${point.name}`);
      }
    }


    this.map.on('popupopen', (e) => {
      const popup = e.popup;
    });
  }

  map!: L.Map;

  ngOnInit() {
    this.loadPoints();

    this.map = L.map('map').setView([-7.7956, 110.3695], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    // 🔥 Ambil semua titik dari LocalStorage
    const points = JSON.parse(localStorage.getItem('points') || '[]');

    points.forEach((p: any) => {
      L.marker([p.lat, p.lng])
        .addTo(this.map)
        .bindPopup(p.name);
    });
  } catch(err: any) {
    console.error('Error when loading points:', err);
  }
}
