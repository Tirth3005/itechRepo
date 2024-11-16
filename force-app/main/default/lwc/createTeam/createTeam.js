import { LightningElement,track,api  } from 'lwc';
import teamRecord from '@salesforce/apex/teamRecordDetail.teamRecord';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class CreateTeamButton extends LightningElement {
    @track isModalOpen = false;
    @track teamName1 = '';
    @track teamName2 = '';
    
    onCreateTeam(){
         this.isModalOpen = true;
    }
    closeModal() {
        this.isModalOpen = false;
    }
    
    handleTeamName1Change(event){
        this.teamName1 = event.target.value;
    }
    handleTeamName2Change(event){
        this.teamName2 = event.target.value;
    }
    submitDetails(event) {
        this.isModalOpen = false;

        teamRecord({homeTeam:this.teamName1,awayTeam:this.teamName2})
        .then(result =>{
            
        })
        .catch(error => {
            console.log("Error"+JSON.stringify(error));
        })
        this.dispatchEvent(
            new ShowToastEvent({
                title: 'Success',
                message: 'Team Created Successfully',
                variant:'success'
            })
        );
    }
}