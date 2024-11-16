import { LightningElement,wire,track } from 'lwc';
import showTeamDetail from '@salesforce/apex/teamRecordDetail.showTeamDetail';
import updateStatusOfTeam from '@salesforce/apex/teamRecordDetail.updateStatusOfTeam';
import { updateRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import {refreshApex} from '@salesforce/apex';
const columns  = [
{label:'Home Team', fieldName:'HomeTeam__c'},
{label:'HomeTeam Score', fieldName:'HomeTeamScore__c', editable : 'True'},
{label:'Away Team', fieldName:'AwayTeam__c'},
{label:'AwayTeam Score', fieldName:'AwayTeamScore__c', editable : 'True'},
{
    type: "button", label: 'Action', initialWidth: 100, typeAttributes: {
        label: 'Finish',
        name: 'Edit',
        title: 'Edit',
        disabled: false,
        value: 'edit',
        iconPosition: 'left',
        variant:'Brand'
    }
}
];
export default class ScoreBoard extends LightningElement {
    
    @track myTeamObj;
    columns = columns;
    updatedItems = [];

    @wire(showTeamDetail)
    showDetail(result){
        this.myTeamObj = result;
        if(result.error){
            this.myTeamObj = undefined;
        }
    }; 

    handleSave(event){
          this.updatedItems = event.detail.draftValues;
          const inputItems = this.updatedItems.slice().map(draft =>{
            const fields = Object.assign({},draft);
           // console.log('fields======'+fields+'=='+JSON.stringify(fields));
            return {fields};
          });  
            const promises = inputItems.map(recordInput => updateRecord(recordInput));
            Promise.all(promises).then(res => {
            console.log('res',res);
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Score Updated Successfully',
                    variant:'success'
                })
            );
            this.updatedItems = [];
            return this.refresh();
        })
        .catch(error => {
                console.log('error',error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error',
                        message: 'An Error Occured!!',
                        variant:'error'
                    })
                );
        }).finally(() => {
            this.updatedItems = [];
        });
    }

    handleRowAction(event){
        const recId = event.detail.row.Id;
        const actionName = event.detail.action.name;
        if (actionName === 'Edit') {
            this.matchFinishAction(recId);
        }
    }

    matchFinishAction(currentId){
        updateStatusOfTeam({recId : currentId}).then(result => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Success!!',
                message: 'Match Finish',
                variant: 'success'
            }));
            return this.refresh();
        }).catch(error => {
            this.dispatchEvent(new ShowToastEvent({
                title: 'Error!!',
                message: JSON.stringify(error),
                variant: 'error'
            }));
        });
    
    }
    async refresh(){
        await refreshApex(this.myTeamObj);
    }

}