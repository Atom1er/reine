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
        console.log(names);
        // names === [{ name: 'Sheet1' }, { name: 'Sheet2' }]
        setSheetsNames(names);
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
        if(names[index].name == '2021_Intercepts_TC0.5'){
          setNoInterErr(false);
        }
        if(names[index].name == 'Sampling'){
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

  const handleSheetSelect = (e, name) => {
    // console.log('here')
    setLoading(true);
    var sheetsDt = sheetsData;
    sheetsDt.forEach((sht) => {
      if (sht.name == name) {
        // console.log('found')
        sht.checked = e.target.checked;
      }
    });
    setSheetsData(sheetsDt);
    // console.log('sheetsDt: ', sheetsDt);
    setLoading(false);
  }

  const filter = () => {
    if(noInterErr || noSamplingErr){
      setNoValidSheetErr(true);
      return;
    } else {
      setNoValidSheetErr(false);
    }
    var sheetsDt = sheetsData;
    //Copying headers
    setLoading(true);
    sheetsDt.forEach((sht) => {
      if (sht.name == 'Sampling') {
        sheetsDt.forEach((sheet) => {
          if (sheet.name == '2021_Intercepts_TC0.5') {
            sheet.rows[0].forEach((el) => {
              sht.rows[0].push(el);
            })
          }
        });
      }
    });
    //merging
    sheetsDt.forEach((shttt, i) => {
      if (shttt.name == 'Sampling') { // found target
        shttt.rows.forEach((samplingEl, sampRowId) => { // loop rows

          sheetsDt.forEach((sheeet) => {
            if (sheeet.name == '2021_Intercepts_TC0.5') { // found data source
              sheeet.rows.forEach((interEl) => {
                if (samplingEl[0] == interEl[0] && samplingEl[1] >= interEl[1] && samplingEl[1] < interEl[2]) { // comparing holes ids && making sure inter Depth From is between sample Depth From and Depth To
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
      if (shhht.name == 'Sampling') {
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
      <h4>Veuillez vous assurez que votre fichier Excel contient les sheets suivant: </h4>
      <ul style={{ fontSize: '1.1rem', textAlign: 'left' }}>
        <li>2021_Intercepts_TC0.5</li>
        <li>Sampling</li>
      </ul>
      <h4>Veuillez egalement vous assurez que les column suivant correspond: </h4>
      <ul style={{ fontSize: '1.1rem', textAlign: 'left' }}>
        <li>A: Hole ID	</li>
        <li>B: Depth From</li>
        <li>C: Depth To</li>
      </ul>
      <h4>Ce programme se chargera de copier les donnees de <strong style={{ textDecoration: 'underline' }}>2021_Intercepts_TC0.5</strong> a <strong style={{ textDecoration: 'underline' }}>Sampling</strong> en ce basant sur cette structure!</h4>
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
          {sheetsData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', marginTop: '25px' }}>
              {sheetsData.map((sheet, id) => (
                <div key={'sheet' + id} className="mdc-touch-target-wrapper" style={{ display: 'flex', margin: '15px 5px', flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap' }}>
                  <Checkbox color="primary" checked={true} onChange={(e) => handleSheetSelect(e, sheet.name)} />{sheet.name}
                </div>))}
            </div>
          )}
          {!loading && input && input.files[0] ? (
            <Button style={{ backgroundColor: 'white', color: 'black' }} onClick={filter}>Generer</Button>
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
