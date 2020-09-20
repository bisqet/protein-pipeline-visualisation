import {html, render, nothing} from '../node_modules/lit-html/lit-html.js';

class ProteinPipelineVisualization extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({mode: "open"});
    this.update();
    this.active = false;
    this.proteins = ''
    this.predictors = [];
    this.proteinHeaders = [];
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
    const proteinPipelineOutputFasta = this.transformToFasta(proteinPipelineOutput);
    console.log(proteinPipelineOutputFasta);
    this.active = true;
    this.proteins = proteinPipelineOutputFasta.proteins;
    this.predictors = proteinPipelineOutputFasta.predictors;
    this.proteinHeaders = proteinPipelineOutput.proteinHeaders;
    this.saveToLocalStorage();
    this.update();
    // this.renderProteinVisualisation(proteinPipelineOutputFasta.proteins)
  }

  saveToLocalStorage() {
    const json = localStorage.getItem('__protein-visualization__') || '{}';
    const stringifiedNewState = JSON.stringify({
      proteins: this.proteins,
      predictors: this.predictors,
      proteinHeaders: this.proteinHeaders
    });
    if (stringifiedNewState !== json) localStorage.setItem('__protein-visualization__', stringifiedNewState);
  }
  getSaveFromLocalStorage(){
    const json = localStorage.getItem('__protein-visualization__') || '{}';
    return JSON.parse(json);
  }
  transformToFasta({proteins, predictors, proteinHeaders}) {
    const proteinPipelineOutputFasta = {
      proteins: '',
      predictors: [],
    };
    for (let i = 0; i < proteinHeaders.length; i++) {
      proteinPipelineOutputFasta.proteins += `\>${proteinHeaders[i]}\n${proteins[i].join('')}\n`;
    }
    proteinPipelineOutputFasta.proteins = proteinPipelineOutputFasta.proteins.trim();
    for (let i = 0; i < predictors.length; i++) {
      proteinPipelineOutputFasta.predictors[i] = {
        proteins: "",
        name: predictors[i].name
      }
      for (let j = 0; j < proteinHeaders.length; j++) {
        proteinPipelineOutputFasta.predictors[i].proteins += `\>${proteinHeaders[j]}\n${predictors[i].proteins[j].join('')}\n`
      }
      proteinPipelineOutputFasta.predictors[i].proteins = proteinPipelineOutputFasta.predictors[i].proteins.trim();

    }
    return proteinPipelineOutputFasta;
  }

  template() {
    return html`
        
      <style>
      .predictor-tab.active{
        outline: -webkit-focus-ring-color auto 1px;
      }
      .predictor-page{
      display: none;
      }
.active{
display: block;
}
.tabs{
display: grid;
grid-template-columns: ${this.proteinHeaders?this.proteinHeaders.map(protein=>`${100/this.proteinHeaders.length}% `):`100%`};
}
.predictor-tab{
background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 32px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
  width: 80%;
  margin: auto;
  margin-bottom: 2px;
}
      /* BASIC */
.protein-msa{
}
.biojs_msa_div {

}

.biojs_msa_stage {
    cursor: default;
    line-height: normal;
    font-family: Helvetica;
}

.biojs_msa_seqblock {
    cursor: move;
}

.biojs_msa_layer{
    display: block;
    white-space: nowrap;
}

.biojs_msa_labels {
    color:black;
    display: inline-block;
    white-space: nowrap;
    cursor: pointer;
    vertical-align:middle;
    overflow: hidden;
    text-overflow: clip;
    /*margin:auto; */
    text-align: left;
}

.biojs_msa_header {
    white-space: nowrap;
    text-align: left;
}

.biojs_msa_labelrow:before {
    content: '';
    display: inline-block;
    width: 0;
    height: 100%;
    vertical-align: middle;
}

.biojs_msa_labelrow{
    height: 100%;
}

.biojs_msa_labelblock::-webkit-scrollbar, .biojs_msa_rheader::-webkit-scrollbar{
    // FIX scrollbars on Mac
    -webkit-appearance: none;
    width: 7px;
    height: 7px;
}
.biojs_msa_labelblock::-webkit-scrollbar-thumb, .biojs_msa_rheader::-webkit-scrollbar-thumb{
    border-radius: 4px;
    background-color: rgba(0,0,0,.5);
    box-shadow: 0 0 1px rgba(255,255,255,.5);
}

/* END BASIC */
/* Marker */

.biojs_msa_marker {
  color: #999;
  white-space: nowrap;
}

.biojs_msa_marker .msa-col-header {
  cursor: pointer;
  cursor: pointer;
  text-align: center;
}

.biojs_msa_marker .msa-col-header:hover {
  color: #f00;
}

/* END Marker */
/* Menubar */

.smenubar .smenubar_alink {
    background: #3498db;
    background-image: -webkit-linear-gradient(top, #3498db, #2980b9);
    background-image: -moz-linear-gradient(top, #3498db, #2980b9);
    background-image: -ms-linear-gradient(top, #3498db, #2980b9);
    background-image: -o-linear-gradient(top, #3498db, #2980b9);
    background-image: linear-gradient(to bottom, #3498db, #2980b9);
    -webkit-border-radius: 28;
    -moz-border-radius: 28;
    border-radius: 28px;
    font-family: Arial;
    color: #ffffff;
    padding: 3px 10px 3px 10px;
    margin-left: 10px;
    text-decoration: none;
}
.smenubar {
    display: inline-block;
}

.smenubar .smenubar_alink:hover {
    cursor: pointer;
}


/* jquery dropdown CSS */

.smenu-dropdown {
    position: absolute;
    z-index: 9;
    display: none;
    margin-left: 5px;
    margin-top: 22px;
}

.smenu-dropdown .smenu-dropdown-menu,
.smenu-dropdown .smenu-dropdown-panel {
    min-width: 160px;
    max-width: 360px;
    list-style: none;
    background: #FFF;
    border: solid 1px #DDD;
    border: solid 1px rgba(0, 0, 0, .2);
    border-radius: 6px;
    box-shadow: 0 5px 10px rgba(0, 0, 0, .2);
    overflow: visible;
    padding: 4px 0;
    margin: 0;
}

.smenu-dropdown .smenu-dropdown-panel {
    padding: 10px;
}

.smenu-dropdown.smenu-dropdown-scroll .smenu-dropdown-menu,
.smenu-dropdown.smenu-dropdown-scroll .smenu-dropdown-panel {
    max-height: 358px;
    overflow: auto;
}

.smenu-dropdown .smenu-dropdown-menu li {
    display: block;
    color: #555;
    text-decoration: none;
    line-height: 18px;
    padding: 3px 15px;
    white-space: nowrap;
}

.smenu-dropdown .smenu-dropdown-menu li:hover {
    background-color: #08C;
    color: #FFF;
    cursor: pointer;
}

.smenu-dropdown .smenu-dropdown-menu .smenu-dropdown-divider {
    font-size: 1px;
    border-top: solid 1px #E5E5E5;
    padding: 0;
    margin: 5px 0;
}

/* END Menubar */

.biojs_msa_div {
  position: relative;
}

.biojs_msa_scale {
  position: absolute;
  bottom: 0;
  right: 0;
  background-color: #fff;
  box-shadow: 0 2px 3px #999;
  border-radius: 3px;
  margin: 5px 0 0 auto;
  padding: 5px;
  text-align: center;
}
.biojs_msa_scale .msa-btngroup {
  margin: 5px auto 0;
}
.biojs_msa_scale [type="range"] {
  cursor: pointer;
}

.biojs_msa_scale .msa-scale-minimised {
}
.biojs_msa_scale .msa-scale-minimised {
}
.biojs_msa_scale .msa-btn-close {
  text-align: right;
  font-size: 0.8em;
  padding: 2px;
}
.biojs_msa_scale .msa-btn-open {
  background-color: #fff;
}

.biojs_msa_scale .msa-hide {
  display: none;
}

.msa-btn {
  cursor: pointer;
  font-size: 1.1em;
  display: inline-block;
  padding: 2px 8px;
  margin-bottom: 0;
  border: 1px solid transparent;
  border-radius: 4px;
  box-sizing: border-box;
}
.msa-btn:hover {
  background-color: #ddd;
}

      </style>
      <div><input type="file" @change="${this.importTSV}">
      <div class="protein-msa" style="width: 100vw"></div>
      <div class="predictors">
        ${this.predictors
      ? html`<div class="tabs">${this.predictors.map(predictor =>
        html`<button class="predictor-tab" data-label="${predictor.name}" @click="${() => {
          this.navigateTab(predictor.name)
        }}">${predictor.name}</button>`
      )}</div>
        <div class="pages">${this.predictors.map((predictor, i) =>
        html`<div class="predictor-page" data-label="${predictor.name}"></div>`
      )}</div>`
      : nothing}

      </div>
      </div>
    `;
  };

  renderPredictors() {
    const predictorPages = Array.from(this.shadowRoot.querySelectorAll(`.predictor-page`));
    predictorPages.forEach((el, i) => {
      const proteins = msa.io.fasta.parse(this.predictors[i].proteins);
      const rowHeight = 15;
      let m = msa({
        el: el,
        zoomer: {
          menuFontsize: "12px",
          autoResize: true,
          rowHeight: rowHeight,
          alignmentHeight: this.proteinHeaders.length * rowHeight
        },
        vis: {
          conserv: false,
          overviewbox: false,
          seqlogo: true
        },
        conf: {
          dropImport: true
        },
        seqs: proteins
      });
      m.render();
    });
  }

  navigateTab(label) {
    const tabs = this.shadowRoot.querySelector(`.tabs`);
    const pages = this.shadowRoot.querySelector(`.pages`);
    const currentActivePage = pages.querySelector(`.active`);
    const currentActiveTab = tabs.querySelector(`.active`);
    if (currentActivePage) currentActivePage.classList.remove('active');
    if (currentActiveTab) currentActiveTab.classList.remove('active');
    pages.querySelector(`[data-label=${label}]`).classList.add('active');
    tabs.querySelector(`[data-label=${label}]`).classList.add('active');
  }

//TODO: when highlight certain column in one sheet, highlight same in second
  update() {
    render(this.template(), this.shadowRoot, {eventContext: this});
    if (this.active) {
      const proteins = msa.io.fasta.parse(this.proteins);
      const rowHeight = 15;
      let m = msa({
        el: this.shadowRoot.querySelector(".protein-msa"),
        zoomer: {
          menuFontsize: "12px",
          autoResize: true,
          rowHeight: rowHeight,
          alignmentHeight: this.proteinHeaders.length * rowHeight
        },
        vis: {
          conserv: false,
          overviewbox: false,
          seqlogo: true
        },
        conf: {
          dropImport: true
        },
        seqs: proteins
      });
      m.render();// first render calculates width bad, so..

      this.renderPredictors();
      console.log(m)
    }
  }

  connectedCallback() {
    const save = this.getSaveFromLocalStorage();
    if(save.predictors&&save.proteins&&save.proteinHeaders){
      this.predictors =save.predictors
      this.proteins =save.proteins
      this.proteinHeaders =save.proteinHeaders
      this.active = true;
      this.update()
    }
  }

  getProteinHeaders(headers) {
    headers = this.normalizeLine(headers);
    const proteins = [];
    const idIndex = 0;
    const separatorIndex = headers.indexOf('Dif');
    const proteinHeaders = headers.slice(idIndex + 1, separatorIndex);
    proteinHeaders.forEach(header => proteins.push([]));
    const countOfProteins = separatorIndex - 1;
    return {idIndex, separatorIndex, proteinHeaders, countOfProteins, proteins}
  }

  getPredictorHeaders({separatorIndex, headers, headers1st, headers2nd, proteinHeaders, countOfProteins}) {
    headers = this.normalizeLine(headers);
    headers1st = this.normalizeLine(headers1st);
    headers2nd = this.normalizeLine(headers2nd);
    let dISNodesIndex = headers.length;
    const predictorHeaders = [];
    for (let i = separatorIndex + 1; i < headers.length; i += countOfProteins) {
      if (headers1st[i] === "DIS") {
        dISNodesIndex = i;
        break;
      }
      predictorHeaders.push({
        name: `${headers[i]}_${headers1st[i]}_${headers2nd[i]}`,
        proteins: []
      });
      proteinHeaders.forEach(header => predictorHeaders[(i - (separatorIndex + 1)) / countOfProteins].proteins.push([]));
    }

    return {predictorHeaders, dISNodesIndex};
  }

  normalizeLine(line) {
    return line.map(value => value.trim())
  }

  tsv2object(tsv) {
    let lines = tsv.trim().split("\n");

    let headers = lines[0].split("\t");
    let headers1st = lines[1].split("\t");
    let headers2nd = lines[2].split("\t");
    const {proteins, idIndex, separatorIndex, countOfProteins, proteinHeaders} = this.getProteinHeaders(headers);
    const {predictorHeaders, dISNodesIndex} = this.getPredictorHeaders({
      proteinHeaders,
      separatorIndex,
      headers,
      headers1st,
      headers2nd,
      countOfProteins
    });
    const predictors = predictorHeaders;
    for (let i = 4; i < lines.length; i++) {

      let currentLine = this.normalizeLine(lines[i].split("\t"));

      for (let j = idIndex + 1; j < currentLine.length; j++) {
        if (j < separatorIndex) {
          proteins[j - (idIndex + 1)].push(currentLine[j]);
          continue;
        }
        if (j === separatorIndex) continue;
        if (j >= dISNodesIndex) break;
        this.getProteinForPredictor({
          index: j,
          predictors,
          separatorIndex,
          countOfProteins,
          proteinHeaders
        }).push(currentLine[j])
      }

    }
    return {proteins, predictors, proteinHeaders}
  }

  getProteinForPredictor({index, predictors, separatorIndex, countOfProteins}) {
    const predictorIndex = Math.floor((index - separatorIndex - 1) / countOfProteins);
    const predictor = predictors[predictorIndex];
    const proteinIndex = (index - separatorIndex - 1) % countOfProteins;
    const protein = predictor.proteins[proteinIndex];
    return protein
  }
}

window.customElements.define('protein-pipeline-visualization', ProteinPipelineVisualization);
