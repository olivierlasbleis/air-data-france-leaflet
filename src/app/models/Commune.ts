
import  Departement from '../models/Departement';
import  StationPollution from '../models/StationPollution';

export default interface Commune extends Departement{

	latitude : number;
	longitude : number;
	 stationPollutionPM10 : StationPollution;

}