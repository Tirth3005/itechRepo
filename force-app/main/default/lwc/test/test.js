import { LightningElement , track} from 'lwc';

export default class Test extends LightningElement {

    @track name = 'Nikhil karkra';
    @track title = 'Salesforce developer';

    changeHandler(event){
        this[event.target.name] = event.target.value
    }
}