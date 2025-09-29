import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false,
})
export class CreatepointPage implements OnInit {
  map!: L.Map;
  name = '';
  coordinates = '';

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);

  ngOnInit() {
    setTimeout(() => {
      this.map = L.map('mapcreate').setView([-7.7956, 110.3695], 13);

      var osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      });

      var esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        { attribution: 'ESRI' }
      );

      osm.addTo(this.map);
      L.control.layers({ "OpenStreetMap": osm, "Esri World Imagery": esri }).addTo(this.map);

      var marker = L.marker([-7.7956, 110.3695], { draggable: true }).addTo(this.map);
      marker.bindPopup('Drag marker to set coordinates').openPopup();

      marker.on('dragend', (e) => {
        let latlng = e.target.getLatLng();
        this.coordinates = latlng.lat.toFixed(9) + ',' + latlng.lng.toFixed(9);
        console.log(this.coordinates);
      });
    });
  }

  async save() {
    if (this.name && this.coordinates) {
      try {
        await this.dataService.savePoint({ name: this.name, coordinates: this.coordinates });
        this.navCtrl.back();
      } catch (error: any) {
        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });
        await alert.present();
      }
    }
  }
}
