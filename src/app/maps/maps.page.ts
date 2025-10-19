import { Component, OnInit, inject } from '@angular/core';
import * as L from 'leaflet';
import { DataService } from '../data.service';
import { Router } from '@angular/router';

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
  private router = inject(Router);
  private markers: L.Marker[] = [];

  async loadPoints() {
    // Clear existing markers
    this.markers.forEach(marker => marker.remove());
    this.markers = [];

    const points: any = await this.dataService.getPoints();
    for (const key in points) {
      if (points.hasOwnProperty(key)) {
        const point = points[key];
        const coordinates = point.coordinates.split(',').map((c: string) => parseFloat(c));
        const marker = L.marker(coordinates as L.LatLngExpression).addTo(this.map);
        marker.bindPopup(`${point.name}<br>
          <span class="icon-container"><ion-icon name="create-outline" class="edit-icon" style="color: greenyellow; cursor: pointer;" data-point-id="${key}"></ion-icon></span>
          <span class="icon-container"><ion-icon name="trash-outline" class="delete-icon" style="color: red; cursor: pointer;" data-point-id="${key}"></ion-icon></span>
        `, { className: 'custom-popup' });
        this.markers.push(marker);
      }
    }
  }

  map!: L.Map;

  ngOnInit() {
    this.map = L.map('map').setView([-7.7956, 110.3695], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.loadPoints();

    this.map.on('popupopen', (e) => {
      const popup = e.popup;
      const deleteIcon = popup.getElement()?.querySelector('.delete-icon');
      if (deleteIcon) {
        deleteIcon.addEventListener('click', (event) => {
          const pointId = (event.target as HTMLElement).dataset['pointId'];
          if (pointId) {
            this.deletePoint(pointId);
          }
        });
      }

      const editIcon = popup.getElement()?.querySelector('.edit-icon');
      if (editIcon) {
        editIcon.addEventListener('click', (event) => {
          const pointId = (event.target as HTMLElement).dataset['pointId'];
          if (pointId) {
            this.editPoint(pointId);
          }
        });
      }
    });
  }

  async deletePoint(pointId: string) {
    if (confirm("Apakah Anda yakin ingin menghapus titik ini?")) {
      await this.dataService.deletePoint(pointId);
      this.loadPoints();
    }
  }

  editPoint(pointId: string) {
    this.router.navigate(['/editpoint', pointId]);
  }
}
