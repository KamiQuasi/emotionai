const minConfidence = 0.5;
await faceapi.nets.ssdMobilenetv1.load('/models', new faceapi.SsdMobilenetv1Options({ minConfidence }));
await faceapi.loadFaceExpressionModel('/models');

export class PhotoRoll extends HTMLElement {
    static get tag() { return 'photo-roll'; }
    static get observedAttributes() {
        return ['max', 'photo'];
    }

    widthLength = 300;
    max = 10;
    photo = 0;
    photos = [];
    canvas = document.createElement('canvas');

    constructor() {
        super();
        this.attachShadow({mode:'open'});
        this.shadowRoot.innerHTML = `
        <style>
        :host { display: block; overflow-y: auto; }
        canvas { display: none; }
        img { 
         grid-row: 1;
        }
        ul { 
            display: grid; 
            grid-template-columns: repeat(2, 1fr);
            grid-gap: 32px;
            justify-items: center;
            list-style: none;
        }
        li {
            display: grid; grid-template-rows: auto 1fr;
            border: #330 solid 2px;
            border-radius: 5px;
            background: #fff;
            box-shadow: #DEDEDE 7px 7px;
            font-size: 1.5em;
            justify-items: center;
            text-transform: capitalize;
            padding: .25em;
        }
        </style>
        <slot></slot>
        <ul></ul>
        `;
        this.roll = this.shadowRoot.querySelector('ul');
        this.detectEmotions = this.detectEmotions.bind(this);
    }

    connectedCallback() {
        this.shadowRoot.appendChild(this.canvas);
        this.canvas.width = this.widthLength;
    }

    attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
    }

    [Symbol.iterator]() { return this; }

    async next(photo) {
        const context = this.canvas.getContext('2d');
        const height = (photo.videoHeight / photo.videoWidth) * this.widthLength;
        this.canvas.height = height;
        context.drawImage(photo, 0, 0, this.widthLength, height);
        const emotion = await this.detectEmotions(photo);

        if (this.photo >= this.max) {
            this.photo = 0;
        }
        if (this.photos.length == this.max) {
            this.photos[this.photo].setAttribute('src', this.canvas.toDataURL('image/png'));
            this.photos[this.photo].parent.innerText = emotion;
        } else {
            const newItem = document.createElement('li');
            newItem.innerText = emotion;
            const newPhoto = document.createElement('img');
            newItem.appendChild(newPhoto);
            this.roll.appendChild(newItem);
            newPhoto.setAttribute('src', this.canvas.toDataURL('image/png'));
            this.photos.push(newPhoto);
        }
    
        return {
            value: this.photo++,
            done: false
        }
    }

    async detectEmotions(photo) {
        if (!(!!faceapi.nets.ssdMobilenetv1.params)) {
            console.log('Model still loading');
            return;
        }

        const results = await faceapi.detectAllFaces(photo, new faceapi.SsdMobilenetv1Options({ minConfidence }))
            .withFaceExpressions();
        const resultText = results
            .map(r => r.expressions.asSortedArray()[0])
            .reduce((a,c) => `${a} ${c.expression} ${100*c.probability.toFixed(2)}%,` ,'');
        return resultText.slice(0, -1);
    }

}
  
window.customElements.define(PhotoRoll.tag, PhotoRoll)