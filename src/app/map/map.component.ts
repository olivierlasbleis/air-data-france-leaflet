import { Component, AfterViewInit, OnInit  } from '@angular/core';
import * as L from 'leaflet';
import {  HttpClient } from '@angular/common/http';
import  SeuilPollution from '../models/SeuilPollution';
import  Commune from '../models/Commune';
import  Departement from '../models/Departement';
import { environment } from 'src/environments/environment';

const URL_BACKEND=environment.backendUrl;
const URL_GEOJSON=environment.backGeojsonUrl;

const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
});

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit  {
  private map;
  polluant : string = 'PM10';
  index : number = 0;
  listeDesSeuilsDePollution : SeuilPollution[] = [];


  constructor(private http: HttpClient) { }

  ngOnInit():void{
    this.http.get(`${URL_BACKEND}/data/${this.polluant}`).subscribe((seuilPollutions: SeuilPollution[]) => {
    console.log(seuilPollutions)
      this.listeDesSeuilsDePollution = seuilPollutions;
    });
  }

  ngAfterViewInit(): void {
    this.initMap(this.polluant);
  }

  modifMap(polluant : string){
    console.log(polluant)
    this.removeAllLayer();
    this.insertionDonnees(polluant);
    this.http.get(`${URL_BACKEND}/data/${polluant}`).subscribe((seuilPollutions: SeuilPollution[]) => {
      console.log(seuilPollutions)
        this.listeDesSeuilsDePollution = seuilPollutions;
      });
  }

  private demarrageMap(): void {
    this.map = L.map('map', {
      center: [ 46, 3 ],
      zoom: 5
    });
    tiles.addTo(this.map);
  }

  private initMap(polluant:string): void {
    this.demarrageMap();
    this.insertionDonnees(polluant);
  }

  private removeAllLayer(){
    let map = this.map;
    map.eachLayer(function (layer) {
      if (layer.feature) {
        console.log(layer)
        map.removeLayer(layer);
      }
      
      
  });
  }
    private insertionDonnees(polluant : string){
      
    this.http.get(`${URL_GEOJSON}/departements-version-simplifiee.geojson`).subscribe((json: any) => {
    
      this.http.get(`${URL_BACKEND}/departements/${this.polluant}`).subscribe((departements: Departement[]) => {
    let i : number = 0;
    // couleur du périmètre et de l'intérieur des communes
    L.geoJSON(json, {

      style: function (feature) {
        return {
          fillColor: departements[i].indicateurPollution,
          weight: 5,
          opacity: 0.2,
          dashArray: '3',
          fillOpacity: 0.5};
      },
      

      
      // Comportement de la carte devant les événements
      // "survol de la sourie d'une commune" => highlightFeature,
      // "sortie de la sourie d'une commune"=> resetHighlight
      // "clic de la sourie sur une commune"=> zoomToFeature
      onEachFeature: function onEachFeature(feature, layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
        }).bindPopup(
        feature.properties.nom + "<br>" +
        departements[i].donneePollution.valeur + " " + departements[i++].donneePollution.uniteDeMesure  
        
          
        , {closeButton: false});
       
        
      }
    }).addTo(this.map);
    console.log(departements)
  });});
  

  function highlightFeature(e) {
    let layer = e.target;
    layer.openPopup();
    layer.setStyle({
      fillOpacity: 1
    });
    if (!L.Browser.ie && !L.Browser.edge) {
      layer.bringToFront();
    }
  }
  //fonction activée à la sortie de la sourie d'une commune
  function resetHighlight(e) {
    e.target.closePopup();
    e.target.setStyle({
      fillOpacity: 0.5
    });
    }


    let http = this.http;
    let map = this.map;
    function zoomToFeature(e) {
      
      let codeDepartement : string = e.target.feature.properties.code;
      
      
      map.eachLayer(function (layer) {
        if (layer.feature) {
          if (layer.feature.properties.code) {
        if(layer.feature.properties.code == codeDepartement){
          map.removeLayer(layer)
          let i : number = 0;
          let nomDepartement = layer.feature.properties.nom.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace("\'", "-").toLowerCase();
          
          http.get(`${URL_GEOJSON}/departements/${codeDepartement}-${nomDepartement}/communes-${codeDepartement}-${nomDepartement}.geojson`
           ).subscribe((communesGeojson: any) => {
            
            http.get(`${URL_BACKEND}/communes/${polluant}/${codeDepartement}`).subscribe((communes: Commune[]) => {
              
              communesGeojson.features = communesGeojson.features.sort((a,b) => a.properties.code - b.properties.code)
              if(communesGeojson.features.length != communes.length){
                let indexSuppression : number[] = [];
                for (let i = 0; i < communesGeojson.features.length; i++) {
                  let n : number = 0;
                  while(n != communes.length && 
                    communes[n].code !== communesGeojson.features[i].properties.code ){
                    n++
                    if(n == communes.length){
                      indexSuppression.unshift(i);
                    }
                  }
                }
                console.log(indexSuppression)
                for (const index of indexSuppression) {
                  communesGeojson.features.splice(index,1)
                }
                
              }
              console.log(communesGeojson)
        console.log(communes)
        let y = 0;
            L.geoJSON(communesGeojson, {
            style: function (feature) {
              return {
                fillColor:  communes[y].indicateurPollution,
                weight: 1,
                opacity: 0.1,
                dashArray: '3',
                fillOpacity: 0.5};
            } ,
            onEachFeature: function onEachFeature(feature, layer) {
              layer.on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
              }).bindPopup(
               "<div styles=\"font-weight: bold\">"+  feature.properties.nom +"</div>"+ "<br>" +
               communes[y].donneePollution.valeur + " " + communes[y].donneePollution.uniteDeMesure + "<br>" +
              "date de la mesure : " + communes[y++].donneePollution.dateDeMesure
              , {closeButton: false});
             
              
            }
        }).addTo(map);
      });
    });
        
    }}}
        
      
  });

      
  
    
}
  
}


  private initMapDepartement(codeDepartement : string, nomDepartement:string): void {
    this.map = L.map('map', {
      center: [ 39.8282, -98.5795 ],
      zoom: 3
      
    });
    tiles.addTo(this.map);
    
    this.http.get('https://raw.githubusercontent.com/gregoiredavid/france-geojson/master/departements/' + codeDepartement + '-' + nomDepartement + 'finistere/communes-'+ codeDepartement +'-'+ nomDepartement +'.geojson').subscribe((json: any) => {
    // couleur du périmètre et de l'intérieur des communes
    L.geoJSON(json, {
      style: {
        fillColor: '#0095FF',
        weight: 5,
        opacity: 0.1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.1
      },
      // Comportement de la carte devant les événements
      // "survol de la sourie d'une commune" => highlightFeature,
      // "sortie de la sourie d'une commune"=> resetHighlight
      // "clic de la sourie sur une commune"=> zoomToFeature
      onEachFeature: function onEachFeature(feature, layer) {
        layer.on({
          mouseover: highlightFeature,
          mouseout: resetHighlight,
          click: zoomToFeature
        });
      }
    }).addTo(this.map);
  });

  function highlightFeature(e) {
    let layer = e.target;
    layer.setStyle({
      weight: 1,
      color: 'red',
      dashArray: '',
      fillOpacity: 0.9
    });
    if (!L.Browser.ie && !L.Browser.edge) {
      layer.bringToFront();
    }
  }
  //fonction activée à la sortie de la sourie d'une commune
  function resetHighlight(e) {
    let layer = e.target;
    layer.setStyle({
      fillColor: '#0095FF',
      weight: 5,
      opacity: 0.1,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.1
    });
    if (!L.Browser.ie && !L.Browser.edge) {
      layer.bringToFront();
    }
     
    }

    function zoomToFeature(e) {
      console.log(e.target.feature.properties)
    }
  }

  
  

}
