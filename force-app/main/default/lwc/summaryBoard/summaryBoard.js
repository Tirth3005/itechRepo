import { LightningElement,wire,track } from 'lwc';
import fatchFinishedMatch from '@salesforce/apex/teamRecordDetail.fatchFinishedMatch';
const columns  = [
    {label:'Home Team', fieldName:'HomeTeam__c'},
    {label:'HomeTeam Score', fieldName:'HomeTeamScore__c'},
    {label:'Away Team', fieldName:'AwayTeam__c'},
    {label:'AwayTeam Score', fieldName:'AwayTeamScore__c'},
    ];
export default class SummaryBoard extends LightningElement {

    @track myTeamObj;
    columns = columns;

    @wire(fatchFinishedMatch)
    finishedMatch(result){
        this.myTeamObj = result;
        if(result.error){
            this.myTeamObj = undefined;
        }
    }

}