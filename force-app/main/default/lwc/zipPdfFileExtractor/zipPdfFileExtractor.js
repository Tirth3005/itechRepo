import { LightningElement, track } from 'lwc';
import JSZip from '@salesforce/resourceUrl/JSZip'; // Load JSZip as static resource
import { loadScript } from 'lightning/platformResourceLoader';
import processExtractedFiles from '@salesforce/apex/ZipFileController.processExtractedFiles';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';


export default class ZipPdfFileExtractor extends LightningElement {
    @track attachedFiles = [];
    @track nonAttachedFiles = [];
    @track processing = false;
    @track uploadedFileName = ''
    zipFileData;
    extractedFiles = [];

    jszipInitialized = false;

    // Debugging log
    debugLog(message) {
        console.log(`[ZipToOrderAttachment] ${message}`);
    }

    // LWC renderedCallback to load JSZip
    renderedCallback() {
        if (!this.jszipInitialized) {
            loadScript(this, JSZip)
                .then(() => {
                    this.jszipInitialized = true;
                    this.debugLog('JSZip loaded successfully.');
                })
                .catch(error => {
                    this.showToast('Error', `Failed to load JSZip: ${error.message}`, 'error');
                });
        }
    }

    // Handle file upload
    handleFileUpload(event) {
        const file = event.target.files[0];
        const uploadedFiles = event.detail.files;
        if (uploadedFiles.length > 0) {
            this.uploadedFileName = uploadedFiles[0].name; // Set the uploaded file name
        }
        const reader = new FileReader();

        reader.onload = () => {
            this.zipFileData = reader.result;
            this.debugLog('ZIP file loaded into memory.');
        };
        reader.onerror = (error) => {
            this.showToast('Error', `Error reading ZIP file: ${error.message}`, 'error');
        };

        reader.readAsArrayBuffer(file);
    }

    // Process the ZIP file
    async processZip() {
        this.processing = true;
        this.debugLog('Starting ZIP file processing.');

        try {
            const zip = new window.JSZip();
            const zipContent = await zip.loadAsync(this.zipFileData);

            const filePromises = [];
            zipContent.forEach((relativePath, file) => {
                if (relativePath.endsWith('.pdf')) {
                    this.debugLog(`Found PDF: ${relativePath}`);
                    filePromises.push(
                        file.async('blob').then(blob => {
                            this.extractedFiles.push({ fileName: relativePath, fileBlob: blob });
                        })
                    );
                }
            });

            await Promise.all(filePromises);
            this.debugLog('All PDFs extracted successfully.');
            this.processFilesInApex();
        } catch (error) {
            this.showToast('Error', `Error processing ZIP file: ${error.message}`, 'error');
        } finally {
            this.processing = false;
        }
    }

    async processFilesInApex() {
        this.debugLog('Sending extracted files to Apex for attachment.');

        const fileData = await Promise.all(
            this.extractedFiles.map(async file => {
                const base64Content = await this.convertBlobToBase64(file.fileBlob);
                return {
                    fileName: file.fileName,
                    fileContent: base64Content
                };
            })
        );

        processExtractedFiles({ fileData })
            .then(result => {
                this.debugLog('Apex processing completed.');
                this.attachedFiles = result.attachedFiles;
                this.nonAttachedFiles = result.nonAttachedFiles;

                this.showToast(
                    'Success',
                    `Attached ${result.attachedFiles.length} files. Failed to attach ${result.nonAttachedFiles.length} files.`,
                    'success'
                );
            })
            .catch(error => {
                this.showToast('Error', `Apex processing failed: ${error.message}`, 'error');
            });
    }

    convertBlobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.onerror = error => reject(error);
            reader.readAsDataURL(blob);
        });
    }

    showToast(title, message, variant) {
        const evt = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(evt);
    }
}