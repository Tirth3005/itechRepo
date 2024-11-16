import { LightningElement,track } from 'lwc';

export default class DemoNew extends LightningElement {

    @track showText = false;
    showHandler() {
        this.showText = true
    }
    @track hideText = false;
    hideHandler(){
        this.hideText = true
    }
}