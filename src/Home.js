import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import readXlsxFile from 'read-excel-file';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import { CSVLink, CSVDownload } from "react-csv";
import CircularProgress from '@material-ui/core/CircularProgress';
import ReactExport from "react-data-export";
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';

const ExcelFile = ReactExport.ExcelFile;
const ExcelSheet = ReactExport.ExcelFile.ExcelSheet;
const ExcelColumn = ReactExport.ExcelFile.ExcelColumn;


function App() {

  const [loading, setLoading] = useState(false);
  const [sheetsNames, setSheetsNames] = useState([]);
  const [sheetsData, setSheetsData] = useState([]);
  const [input, setInput] = useState(null);
  const [excelHeaders, setExcelHeaders] = useState(null);
  const [exceldt, setExceldt] = useState(null);
  const [renderExcel, setRenderExcel] = useState(false);
  const [sampling, setSampling] = useState(false);
  const [noFileErr, setNoFileErr] = useState(false);
  const [noSamplingErr, setNoSamplingErr] = useState(true);
  const [noInterErr, setNoInterErr] = useState(true);
  const [noValidSheetErr, setNoValidSheetErr] = useState(false);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    setInput(document.getElementById('input'))
  }, [])

  const getFile = () => {
    console.log('clicked');


    if (input.files[0]) {
      setLoading(true);
      setNoFileErr(false);
      // input.addEventListener('change', () => {
      readXlsxFile(input.files[0], { getSheets: true }).then((names) => {
        console.log("names: ", names);
        // names === [{ name: 'Sheet1' }, { name: 'Sheet2' }]
        var nmes = [];
        names.forEach(n => {
          nmes.push({
            name: n.name,
            checked: false
          })
        })
        setSheetsNames(nmes);
        setSheetsData([]);
        setNoInterErr(true);
        setNoSamplingErr(true);
        if (names.length > 0) {
          getData(names, 0);
        }
        // 
      })
    } else {
      setNoFileErr(true);
    }
    // })
  }

  const getData = (names, index) => {
    if (names.length > index) {
      readXlsxFile(input.files[0], { sheet: names[index].name }).then((rows) => {
        var sheetsDt = sheetsData;
        sheetsDt.push({
          name: names[index].name,
          rows: rows,
          checked: true
        });
        if (names[index].name == from) {
          setNoInterErr(false);
        }
        if (names[index].name == to) {
          setNoSamplingErr(false);
        }
        setSheetsData(sheetsDt);
        var i = index + 1;
        setTimeout(() => {
          getData(names, i);
        }, 1000)
      })
    } else {
      setTimeout(() => {
        setLoading(false);
        console.log("sheetsData: ", sheetsData);
      }, 1000)
    }
  }

  const handleSheetSelect = (e, type) => {
    if(type == 'from'){
      setFrom(e.target.value)
    } else {
      setTo(e.target.value);
    }
  }

  const filter = () => {
    // if (noInterErr || noSamplingErr) {
    //   setNoValidSheetErr(true);
    //   return;
    // } else {
    //   setNoValidSheetErr(false);
    // }
    var sheetsDt = sheetsData;
    //Copying headers
    setLoading(true);
    sheetsDt.forEach((sht) => {
      if (sht.name == to) {
        sheetsDt.forEach((sheet) => {
          if (sheet.name == from) {
            sheet.rows[0].forEach((el) => {
              sht.rows[0].push(el);
            })
          }
        });
      }
    });
    //merging
    sheetsDt.forEach((shttt, i) => {
      if (shttt.name == to) { // found target
        shttt.rows.forEach((samplingEl, sampRowId) => { // loop rows

          sheetsDt.forEach((sheeet) => {
            if (sheeet.name == from) { // found data source
              sheeet.rows.forEach((interEl) => {
                if (samplingEl[0] == interEl[0] && samplingEl[1] && interEl[1] && interEl[2] && Number(samplingEl[1].toString().replace(',', '.')) >= Number(interEl[1].toString().replace(',', '.')) && Number(samplingEl[1].toString().replace(',', '.')) < Number(interEl[2].toString().replace(',', '.'))) { // comparing holes ids && making sure inter Depth From is between sample Depth From and Depth To
                  // console.log("in");
                  interEl.forEach((tocopy) => { // then copy all to sampling
                    samplingEl.push(tocopy);
                  })
                }
              });
            }
          })
        })
      }
    });

    var doneData = [];

    var selectedDt = null;
    var headersDt = null;
    sheetsDt.forEach((shhht, i) => {
      if (shhht.name == to) {
        selectedDt = shhht.rows;
      }
    });

    setSampling(selectedDt);

    headersDt = selectedDt[0];
    setExcelHeaders(selectedDt[0]);

    for (var l = 0; l < selectedDt.length; l++) {
      var objj = {};
      for (var s = 0; s < selectedDt[l].length; s++) {
        objj[selectedDt[0][s]] = selectedDt[l][s]
      }
      doneData.push(objj);
    }

    setExceldt(doneData);
    setLoading(false);
    setRenderExcel(true);
    console.log("doneData: ", doneData);
    console.log("sheetsDt when crazyness is done: ", sheetsDt);
  }


  const copy = (obj1) => {
    var obj3 = {};
    for (var attrname in obj1) { obj3[attrname] = obj1[attrname]; }
    return obj3;
  }

  const copyArr = (arr1) => {
    var arr2 = [];
    for (var i = 0; i < arr1.length; i++) { arr2[i] = copy(arr1[i]); }
    return arr2;
  }

  return (
    <div className="App App-header">
      <h4>Pour commencer Cliquez sure "Choose File". </h4>
      <ul style={{ fontSize: '1.1rem', textAlign: 'left' }}>
        <li>Selectionnez votre fichier excel</li>
        <li>Cliquez sure "Commencer"</li>
      </ul>
      <h4>Veuillez vous assurez que les column suivant sont presentes et correspondes: </h4>
      <ul style={{ fontSize: '1.1rem', textAlign: 'left' }}>
        <li>A: Hole ID	</li>
        <li>B: Depth From</li>
        <li>C: Depth To</li>
      </ul>
      <h4>Ce programme se chargera de copier les donnees en ce basant sur cette structure!</h4>
      <h4>Le programme affichera deux fois la meme liste </h4>
      <ul style={{ fontSize: '1.1rem', textAlign: 'left' }}>
        <li>En utilisant la liste de gauche, selection le sheet d'origine.</li>
        <li>Puis utilisez la liste de droite pour selectionner le sheet de destination</li>
        <li>Cliquez maintenant sur "GENERER"</li>
        <li>Nommez votre fichier en precisant l'extension (.csv)</li>
      </ul>
      <FormControl component="fieldset">
        {/* <FormLabel component="legend">Label Placement</FormLabel> */}
        <FormGroup aria-label="position" row style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
            <input type="file" id="input" accept="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
            {!loading ? (
              <Button style={{ backgroundColor: 'white', color: 'black', margin: '0px 15px' }} onClick={getFile}>Commencer</Button>
            ) : null}
          </div>
          {noFileErr && (<span style={{ color: 'red', margin: '15px 0px' }}>Veuillez attacher un fichier excel. Cliquez sure "choose File"</span>)}
          {sheetsNames.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: '55px' }}>
              <FormControl component="fieldset" style={{borderRight: '1px solid white', marginRight: '15px'}}>
                <FormLabel style={{color: 'white'}}>COPIER DE:</FormLabel>
                <RadioGroup aria-label="gender" name="gender1" value={from} onChange={(e) => handleSheetSelect(e, 'from')}>
                  {sheetsNames.map((n, id) => (
                    <div key={'n' + id} className="mdc-touch-target-wrapper" style={{ display: 'flex', margin: '15px 5px', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                      {/* <Checkbox color="primary" checked={n.checked} onChange={(e) => handleSheetSelect(e, n.name)} />{n.name} */}
                      <FormControlLabel value={n.name} control={<Radio />} label={n.name} />
                    </div>))}
                </RadioGroup>
              </FormControl>
              <FormControl component="fieldset">
                <FormLabel style={{color: 'white'}}>ET COLLER DANS:</FormLabel>
                <RadioGroup aria-label="gender" name="gender12" value={to} onChange={(e) => handleSheetSelect(e, 'to')}>
                  {sheetsNames.map((n, id) => (
                    <div key={'n-' + id} className="mdc-touch-target-wrapper" style={{ display: 'flex', margin: '15px 5px', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                      {/* <Checkbox color="primary" checked={n.checked} onChange={(e) => handleSheetSelect(e, n.name)} />{n.name} */}
                      <FormControlLabel value={n.name} control={<Radio />} label={n.name} />
                    </div>))}
                </RadioGroup>
              </FormControl>
            </div>
          )}
          {!loading && input && input.files[0] ? (
            <Button style={{ backgroundColor: 'white', color: 'black', marginBottom: '15px'}} onClick={filter}>Generer</Button>
          ) : (<> {loading && <h4><CircularProgress /> Veuillez patienter... loading...</h4>} </>)}
          {noValidSheetErr && (
            <span style={{ color: 'red', margin: '15px 0px' }}>Veuillez attacher un fichier excel contenant un sheet <strong style={{ textDecoration: 'underline' }}>"2021_Intercepts_TC0.5"</strong> et <strong style={{ textDecoration: 'underline' }}>"Sampling"</strong> </span>
          )}
        </FormGroup>
      </FormControl>
      {renderExcel && (
        <CSVDownload data={sampling} target="_blank" />
        //     <ExcelFile>
        //     <ExcelSheet data={exceldt} name="Sampling">
        //       {excelHeaders.map((head, iii) => (
        //         <ExcelColumn key={"h"+iii} label={head} value={head}/>
        //       ))}
        //     </ExcelSheet>
        // </ExcelFile>
      )}
    </div>
  );
}

export default App;
