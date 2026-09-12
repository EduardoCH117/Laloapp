import { Component } from '@angular/core';

import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonIcon
} from '@ionic/angular';

import { PhotoService, UserPhoto } from '../services/photo.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    IonHeader,
    IonToolbar,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonFab,
    IonFabButton,
    IonIcon
  ]
})
export class Tab1Page {

  constructor(public photoService: PhotoService) {}

  async addPhotoToGallery(): Promise<void> {
    await this.photoService.addNewToGallery();
  }

  async showActionSheet(photo: UserPhoto, position: number): Promise<void> {
    console.log('Foto seleccionada:', photo);
    console.log('Posición:', position);
  }
}