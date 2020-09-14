import {html, render} from '../node_modules/lit-html/lit-html.js';

class ProteinPipelineVisualization extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.update();
  }

  importTSV(e) {
    const reader = new FileReader();
    reader.addEventListener('load', (event) => {
      const tsv = event.target.result;
      const proteinPipelineOutput = this.tsv2object(tsv);
      console.log(proteinPipelineOutput);
      this.renderMSA(proteinPipelineOutput)
    });
    reader.readAsText(e.target.files[0])
  }

  renderMSA(proteinPipelineOutput) {

  }

  template() {
    return html`
      <style>
      </style>
      <input type="file" @change="${this.importTSV}">
    `;
  }

  update() {
    render(this.template(), this.shadowRoot, {eventContext: this});
  }

  getProteinHeaders(headers) {
    headers = this.normalizeLine(headers);
    const proteins = [];
    const idIndex = 0;
    const separatorIndex = headers.indexOf('Dif');
    const proteinHeaders = headers.slice(idIndex+1, separatorIndex);
    proteinHeaders.forEach(header=>proteins.push([]));
    const countOfProteins = separatorIndex-1;
    return {idIndex, separatorIndex, proteinHeaders, countOfProteins, proteins}
  }

  getPredictorHeaders({separatorIndex, headers, headers1st, headers2nd, proteinHeaders, countOfProteins}) {
    headers = this.normalizeLine(headers);
    headers1st = this.normalizeLine(headers1st);
    headers2nd = this.normalizeLine(headers2nd);
    let dISNodesIndex = headers.length;
    const predictorHeaders = [];
    for (let i = separatorIndex+1; i < headers.length; i+=countOfProteins) {
      if(headers1st[i]==="DIS"){
        dISNodesIndex = i;
        break;
      }
      predictorHeaders.push({
        name: `${headers[i]}_${headers1st[i]}_${headers2nd[i]}`,
        proteins:[]
      });
      proteinHeaders.forEach(header=>predictorHeaders[(i-(separatorIndex+1))/countOfProteins].proteins.push([]));
    }

    return {predictorHeaders,dISNodesIndex};
  }

  normalizeLine(line) {
    return line.map(value => value.trim())
  }

  tsv2object(tsv) {
    let lines = tsv.trim().split("\n");

    let headers = lines[0].split("\t");
    let headers1st = lines[1].split("\t");
    let headers2nd = lines[2].split("\t");
    const {proteins, idIndex, separatorIndex, countOfProteins,proteinHeaders} = this.getProteinHeaders(headers);
    const {predictorHeaders,dISNodesIndex} = this.getPredictorHeaders({proteinHeaders, separatorIndex, headers, headers1st, headers2nd, countOfProteins});
    const predictors = predictorHeaders;
    for (let i = 4; i < lines.length; i++) {

      let currentLine = this.normalizeLine(lines[i].split("\t"));

      for (let j = idIndex+1; j < currentLine.length; j++) {
        if(j<separatorIndex){
          proteins[j-(idIndex+1)].push(currentLine[j]);
          continue;
        }
        if(j===separatorIndex)continue;
        if(j>=dISNodesIndex)break;
        this.getProteinForPredictor({index:j, predictors, separatorIndex, countOfProteins,proteinHeaders}).push(currentLine[j])
      }

    }
    return {proteins, predictors}
  }
  getProteinForPredictor ({index, predictors, separatorIndex, countOfProteins, proteinHeaders}) {
    const predictorIndex = Math.floor((index-separatorIndex-1)/countOfProteins);
    const predictor = predictors[predictorIndex];
    const proteinIndex = (index-separatorIndex-1)%countOfProteins;
    const protein = predictor.proteins[proteinIndex];
    return protein
  }
}

window.customElements.define('protein-pipeline-visualization', ProteinPipelineVisualization);
