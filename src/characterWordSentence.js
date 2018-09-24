import React, { Component } from 'react';
import { render } from 'react-dom';
import { compose } from 'ramda';
//import 'whatwg-fetch';
import './style.css';
import Draft from 'draft-js';
//import {Editor, EditorState} from 'draft-js';
import styles from './styles';
import * as triggers from './triggers';
import {AutocompleteEditor} from './autocomplete';
import SuggestionList from './suggestions';
import {normalizeIndex, filterArray} from './utils';
//import * as triggers from './triggers';
import * as data from './data';
import addSuggestion from './addsuggestion';

var allUserData = '';
var filteredArrayTemp;

const {
  convertFromRaw,
  convertToRaw,
  CompositeDecorator,
  Editor,
  EditorState,
  ContentState,
} = Draft;

var name ='were doing' + '\n'+ 'this together';
//var ContentState = Draft.ContentState;
const rawContent = {
  blocks: [
    {
      text: (
        'This is an "immutable" entity: Superman. Deleting any ' +
        'characters will delete the entire entity. Adding characters ' +
        'will remove the entity from the range.'
      ),
      type: 'unstyled',
      entityRanges: [{offset: 31, length: 8, key: 'first'}],
    },
    {
      text: '',
      type: 'unstyled',
    },
    {
      text: name,
      type: 'unstyled',
    },
    {
      text: '',
      type: 'unstyled',
    },
    {
      text: (
        'This is a "mutable" entity: Batman. Characters may be added ' +
        'and removed.'
      ),
      type: 'unstyled',
      entityRanges: [{offset: 28, length: 6, key: 'second'}],
    },
    {
      text: '',
      type: 'unstyled',
    },
    {
      text: (
        'This is a "segmented" entity: Green Lantern. Deleting any ' +
        'characters will delete the current "segment" from the range. ' +
        'Adding characters will remove the entire entity from the range.'
      ),
      type: 'unstyled',
      entityRanges: [{offset: 30, length: 13, key: 'third'}],
    },
  ],
  entityMap: {
    first: {
      type: 'TOKEN',
      mutability: 'IMMUTABLE',
      data: {
        content: 'firstName', // can be whatever
      },
    },
    second: {
      type: 'TOKEN',
      mutability: 'MUTABLE',
    },
    third: {
      type: 'TOKEN',
      mutability: 'SEGMENTED',
    },
  },
};




class CharacterWordSentence extends React.Component {
  constructor(props) {
    super(props);
    //this.state = {editorState: EditorState.createEmpty()};
    //this.state = {editorState: EditorState.createWithContent(blocks, CompositeDecorator)};
    //this.state = {editorState: EditorState.createEmpty(blocks, CompositeDecorator)};
    const decorator = new CompositeDecorator([
      {
        strategy: getEntityStrategy('IMMUTABLE'),
        component: TokenSpan,
      },
      {
        strategy: getEntityStrategy('MUTABLE'),
        component: TokenSpan,
      },
      {
        strategy: getEntityStrategy('SEGMENTED'),
        component: TokenSpan,
      },
    ]);
    const blocks = convertFromRaw(rawContent);
    this.onChange = (editorState) => this.setState({editorState});
    //this.focus = () => this.refs.editor.focus();
    this.onAutocompleteChange = (autocompleteState) => this.setState({
      autocompleteState
    });

    this.onInsert = (insertState) => {
      if (!filteredArrayTemp) {
        return null;
      }
      const index = normalizeIndex(insertState.selectedIndex, filteredArrayTemp.length);
      insertState.text = insertState.trigger + filteredArrayTemp[index];
      return addSuggestion(insertState);
    };

    this.state = {
      editorState: EditorState.createWithContent(blocks, decorator),
      autocompleteState: null,
    };
  }
   
  state = {
    text: '',
    charCount: 0,
    wordCount: 0,
    sentenceCount: 0,
    paragraphCount: 0,
    word:'',
    tokenizeContent:'',
   // editorState: EditorState.createEmpty()
   // editorState: EditorState.createWithContent(blocks, decorator)
  }

  componentDidMount() {
    this.getBacon()
      .then(bacon => {
        this.setState({ text: bacon.join('\n\n') }, () => this.setCounts(this.state.text));
       // this.setState({ text: "New York is a city in America." }, () => this.setCounts(this.state.text));
      })
      .catch(err => this.setState({ text: `Error: ${err.message}` }));

     // this.setCounts
   // allUserData = this.analyzer();
  //  console.log(allUserData);
   // this.setState({ word: 'good' });
  }

  /*
    Fetches three parapgraphs from https://baconipsum.com/
  */
  getBacon = async () => {
    //getBacon = async () => {
    const response = await fetch('https://baconipsum.com/api/?type=all-meat&paras=3');
    const body = await response.json();
    
    if (response.status !== 200) 
      throw Error(body.message);

    //return body;

    /*var request = require('request');

    var dataString = 'The quick brown fox jumped over the lazy dog.';

    var options = {
    url: 'http://textanalysis.sdsd.co:9005/?properties={%22annotators%22%3A%22tokenize%2Cssplit%2Cpos%22%2C%22outputFormat%22%3A%22json%22}',
    method: 'POST',
    body: dataString
           };

    function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
        console.log(body);
              }
           }

    request(options, callback);*/
    const  sampleText = "New York is a city in America.";
    return body;
  }

  /*
    When pressing Enter key individual elements in the array will come
    with the 'break' character and producing an incorrect word count. This function
    removes those breaks and splits them.
    i.e. ["↵↵Turkey","pork","cow","tri-tip","↵↵Bresaola↵↵brisket","pork"]
  */
  removeBreaks = arr => {
    const index = arr.findIndex(el => el.match(/\r?\n|\r/g));
    
    if (index === -1) 
      return arr;
    
    const newArray = [
      ...arr.slice(0,index),
      ...arr[index].split(/\r?\n|\r/),
      ...arr.slice(index+1, arr.length)
    ];

    return this.removeBreaks(newArray);
  }

  /*
    When entering multiple spaces or breaks (Enter key), the array will come
    with empty elements. This function removes those elements. 
    i.e. ["turkey.", "", "Bacon"]
  */
  removeEmptyElements = arr => {
    const index = arr.findIndex(el => el.trim() === '');

    if (index === -1) 
      return arr;

    arr.splice(index, 1);

    return this.removeEmptyElements(arr)
  };

  removeCommaFullStop = arr => {
    const index = arr.findIndex(el => el.match(/[,\.\/]/));

    //console.log(arr[index]);

    if (index === -1) 
      return arr;
    var str = arr[index];
    var regex = /[,\.\/]/;
    arr[index] = str.replace(regex, '');
    //arr.splice(index, 1);

    return this.removeCommaFullStop(arr)
  };

  setCounts = value => {
    const trimmedValue = value.trim();
    const wordsCounter = compose(this.removeEmptyElements, this.removeBreaks)(trimmedValue.split(' '));
    const words = compose(this.removeEmptyElements, this.removeBreaks, this.removeCommaFullStop)(trimmedValue.split(' ')).join('\n');
    const sentences = compose(this.removeEmptyElements, this.removeBreaks)(trimmedValue.split('.'));
    const paragraphs = this.removeEmptyElements(trimmedValue.split(/\r?\n|\r/));
    
    this.setState({
      text: value,
      word: words,
      charCount: trimmedValue.length,
      wordCount: value === '' ? 0 : wordsCounter.length,
      sentenceCount: value === '' ? 0 : sentences.length,
      paragraphCount: value === '' ? 0 : paragraphs.length
    });
    
  }
    //analyzer =  allUserData => {
    analyzer =  () => {
  
    var request = require('request');
    var dataString = this.state.text;
    const rawContent = {
      blocks: [
        {
          text: (
            ''
          ),
          type: 'unstyled',
          entityRanges: [{offset: 0, length: 0, key: 'first'}],
          //entityRanges: [{offset: 23, length: wordLength[0], key: 'first'}],
        },
      ],
      entityMap: {
        first: {
          type: 'TOKEN',
          //mutability: 'IMMUTABLE',
          mutability: 'MUTABLE',
          data: {
            content: 'firstName', // can be whatever
          },
        },
        second: {
          type: 'TOKEN',
          mutability: 'MUTABLE',
        },
        third: {
          type: 'TOKEN',
          mutability: 'SEGMENTED',
        },
      },
     
    };
    let currentComponent = this;
    var options = {
   // url: 'http://textanalysis.sdsd.co:9005/?properties={%22annotators%22%3A%22tokenize%2Cssplit%2Cpos%22%2C%22outputFormat%22%3A%22json%22}',
    //url: 'http://textanalysis.sdsd.co:9005/?properties={"annotators":"tokenize,ssplit,pos","outputFormat":"json"}',
    //url: 'http://textanalysis.sdsd.co:9005/?properties={"annotators":"ner","outputFormat":"json"}',
    url: 'http://textanalysis.sdsd.co:9005/?properties={"annotators":"ner","outputFormat":"json"}',
    method: 'POST',
    body: dataString
           };

    function callback(error, response, body) {
    if (!error && response.statusCode == 200) {

        console.log(body);

        var nerReturnedValue = JSON.parse(body);
       // console.log( nerReturnedValue.sentences[0]['tokens'][0]['word']);
        //console.log( nerReturnedValue.sentences[2]['entitymentions'].length );
        var nerValues = '';
        var offsetBeginPosition = [];
        var offsetEndPosition = [];
        var wordLength = [];
         for(var i=0; i < nerReturnedValue.sentences.length; i++){
          console.log(i);
           //  for(var j=0; j < nerReturnedValue.sentences[i]['entitymentions'].length; j++){
            for(var j=0; j < nerReturnedValue.sentences[i]['tokens'].length; j++){  
           /*nerValues = nerValues + '\n' + nerReturnedValue.sentences[i]['entitymentions'][j]['text'] 
           + '  ' +  '-------------------------' + nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] ;
          offsetBeginPosition[j] = nerReturnedValue.sentences[i]['entitymentions'][j]['characterOffsetBegin'];
          
          offsetEndPosition[j] = nerReturnedValue.sentences[i]['entitymentions'][j]['characterOffsetEnd'];
          wordLength[j] = offsetEndPosition[j] -  offsetBeginPosition[j];*/
          //var nerValuesWord = nerReturnedValue.sentences[i]['entitymentions'][j]['text'] 
         // + '  ' +  '-------------------------' + nerReturnedValue.sentences[i]['entitymentions'][j]['ner'];
         var isNer = true;
         if(nerReturnedValue.sentences[i]['tokens'][j]['ner'] == 'O'){

             isNer = false;

         }
         if(!isNer) {
         var nerValuesWord = nerReturnedValue.sentences[i]['tokens'][j]['originalText'] 
          + '  ' +  '-------------------------' + 'O';
          rawContent.blocks.push( {
            text: nerValuesWord + '\n',
            type: 'unstyled',
          //  entityRanges: [{offset: 0, length: nerValuesWord.length, key: 'first'}],
          });
          } 
          else if(isNer && nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "NUMBER")
          {
            var nerValuesWord = nerReturnedValue.sentences[i]['tokens'][j]['originalText'] 
           // + '  ' +  '-------------------------' + nerReturnedValue.sentences[i]['tokens'][j]['ner'];
           + '  ' +  '-------------------------' + 'O';
            rawContent.blocks.push( {
              text: nerValuesWord + '\n',
              type: 'unstyled',
            //  entityRanges: [{offset: 0, length: nerValuesWord.length, key: 'first'}],
            });

          }
          //else if(isNer && nerReturnedValue.sentences[i]['tokens'][j]['ner'] != "NUMBER")
          else{
            var nerValuesWord = nerReturnedValue.sentences[i]['tokens'][j]['originalText'] 
            + '  ' +  '-------------------------' + nerReturnedValue.sentences[i]['tokens'][j]['ner'];
            rawContent.blocks.push( {
              text: nerValuesWord + '\n',
              type: 'unstyled',
              entityRanges: [{offset: 0, length: nerValuesWord.length, key: 'first'}],
            });

          }
          // console.log(nerValues);
            }
         }
         //console.log(wordLength);
         //const content = currentComponent.state.editorState.getCurrentContent();
         //console.log(content);
        // console.log(convertToRaw(content));
        // const blocked = convertFromRaw(content);
        const decorator = new CompositeDecorator([
          {
            strategy: getEntityStrategy('IMMUTABLE'),
            component: TokenSpan,
          },
          {
            strategy: getEntityStrategy('MUTABLE'),
            component: TokenSpan,
          },
          {
            strategy: getEntityStrategy('SEGMENTED'),
            component: TokenSpan,
          },
        ]);
       

       const blocks = convertFromRaw(rawContent);
        const plainText = 'Lorem ipsum dolor sit amet, consectetuer adipiscing elit.';
        const content = ContentState.createFromText(nerValues);
         currentComponent.setState({
         word: nerValues,
        // editorState: EditorState.createWithContent(content)
         //editorState: EditorState.createEmpty() 
         editorState: EditorState.createWithContent(blocks, decorator) 
        // editorState: EditorState.push(blocked)
            
        // createWithContent(blocks, decorator)
        //changeType: EditorChangeType
         // word: nerReturnedValue.sentences[0]['tokens'][0]['word']
        // word: nerReturnedValue.sentences[0]['entitymentions'][0]['text'] 
        // + '  ' +  nerReturnedValue.sentences[0]['entitymentions'][0]['ner']
        })
       // console.log(allUserData);
        //greeting(allUserData);
              }
           }

    request(options, callback);
    
    function greeting(name) {
     // tokenizeContent = name;
      //alert('Hello ' + name);
      
      }
      
  }


  handleChange = e => this.setCounts(e.target.value);
  renderAutocomplete() {
    const {
      autocompleteState,
      onSuggestionClick
    } = this.state;
    if (!autocompleteState) {
      return null;
    }
    filteredArrayTemp = this.getFilteredArray(autocompleteState.type, autocompleteState.text);
    autocompleteState.array = filteredArrayTemp;
    autocompleteState.onSuggestionClick = this.onSuggestionItemClick;
    return <SuggestionList suggestionsState = {
      autocompleteState
    }
    />;
  };

  getFilteredArray(type, text) {
    const dataArray = type == triggers.PERSON ? data.persons : data.tags;
    const filteredArray = filterArray(dataArray, text.replace(triggers.regExByType(type), ''));
    return filteredArray;
  }
  //logState = e => this.analyzer();
  //this.focus = () => this.refs.editor.focus();
  //onChange = e => (editorState) => this.setState({editorState});
 /* this.logState = () => {
    const content = this.state.editorState.getCurrentContent();
    console.log(convertToRaw(content));
  };*/
  
  

  render() {
    
    return (
      
      <div>
        <div id="topmenu"><p><button onClick={() => this.analyzer()}>PreAnalyze</button></p></div>
        
        <textarea rows='15' onChange={this.handleChange} value={this.state.text}></textarea>
        
        <p><strong>Character Count:</strong> {this.state.charCount}<br/>
        <strong>Word Count:</strong> {this.state.wordCount}<br/>
        <strong>Sentence Count:</strong> {this.state.sentenceCount}<br/>
        <strong>Paragraph Count:</strong> {this.state.paragraphCount}</p>

         <div style={styles.root}>
            {
          this.renderAutocomplete()
                }
        <div style={styles.editor} >
        < AutocompleteEditor editorState = {
        this.state.editorState
        }
        onChange = {
        this.onChange
        }
        onAutocompleteChange = {
        this.onAutocompleteChange
        }
        onInsert = {
        this.onInsert
        }
        />
        </div>
        <input
          onClick={this.logState}
          style={styles.button}
          type="button"
          value="Log State"
        />
        </div>
        
        </div>
    );
  }
}

function getEntityStrategy(mutability) {
  return function(contentBlock, callback, contentState) {
    //console.log(contentBlock.getText());
    contentBlock.findEntityRanges(
      (character) => {
        const entityKey = character.getEntity();
        if (entityKey === null) {
          return false;
        }
       // console.log(convertToRaw(entityKey));
        return contentState.getEntity(entityKey).getMutability() === mutability;
        
      },
      callback
    );
  };
}
function getDecoratedStyle(mutability) {
  switch (mutability) {
    case 'IMMUTABLE': return styles.immutable;
    case 'MUTABLE': return styles.mutable;
    case 'SEGMENTED': return styles.segmented;
    default: return null;
  }
}
const TokenSpan = (props) => {
  const style = getDecoratedStyle(
    props.contentState.getEntity(props.entityKey).getMutability()
    
  );
 // const style = styles.immutable;
  return (
    <span data-offset-key={props.offsetkey} style={style}>
      {props.children}
    </span>
  );
};

/*const styles = {
  root: {
    fontFamily: '\'Helvetica\', sans-serif',
    padding: 20,
    width: '100%',
  },
  editor: {
    border: '1px solid #ccc',
    cursor: 'text',
    minHeight: 80,
    padding: 10,
   
  }, 
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  immutable: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    padding: '2px 0',
  },
  mutable: {
    backgroundColor: 'rgba(204, 204, 255, 1.0)',
    padding: '2px 0',
  },
  segmented: {
    backgroundColor: 'rgba(248, 222, 126, 1.0)',
    padding: '2px 0',
  },
  suggestions: {
    borderRadius: 3,
    margin: 0,
    padding: 0,
    background: 'white',
    boxShadow: '0 0 0 1px rgba(0, 0, 0, .1), 0 1px 10px rgba(0, 0, 0, .35)',
    listStyleType: 'none'
  },
  person: {
    margin: 0,
    padding: '16px 24px',
    color: '#343d46'
  },
  selectedPerson: {
    margin: 0,
    padding: '16px 24px',
    background: '#a7b5bf',
    color: 'white',
    borderRadius: 3
  },
  link: {
    color: '#a7b5bf'
  }
};*/

export default CharacterWordSentence;
//render(<App />, document.getElementById('root'));

