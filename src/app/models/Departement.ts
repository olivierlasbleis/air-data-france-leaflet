import DonneePollution from "../models/DonneePollution";

export default interface Departement{

    code  : string;
	nom : string;
	donneePollution : DonneePollution;
	indicateurPollution : string;
	

}