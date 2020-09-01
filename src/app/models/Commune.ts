
import  Departement from '../models/Departement';
import  StationPollution from '../models/StationPollution';

export default interface Commune extends Departement{

	latitude : number;
	longitude : number;
	 stationPollutionPM10 : StationPollution;
	 stationPollutionSO2: StationPollution;
     stationPollutionPM25: StationPollution;
     stationPollutionO3 : StationPollution;
	 stationPollutionNO2: StationPollution;
	 stationPollutionCO: StationPollution;

}