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
//var NerRecognisedEntity = ['France','France'];
var NerRecognisedEntity = [];
var NerRecognisedEntityRegexValue = [];
var filteredArrayTemp;
var regexStringNer = '';
var regexString ='\\brocket\\b|\\bkolade\\b';


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
        ' Paste Text to Analyse Here Over. Press Back Space to Start ' 
      ),
      type: 'unstyled',
      entityRanges: [{offset: 0, length: 70, key: 'first'}],
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
   /* const decorator = new CompositeDecorator([
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
    ]);*/
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: HandleSpan,
      },
      {
        strategy: hashtagStrategy,
        component: HashtagSpan,
      },
    ]);
    //const blocks = convertFromRaw(rawContent);
    

    this.onInsert = (insertState) => {
      if (!filteredArrayTemp) {
        return null;
      }
      const index = normalizeIndex(insertState.selectedIndex, filteredArrayTemp.length);
      insertState.text = insertState.trigger + filteredArrayTemp[index];
      return addSuggestion(insertState);
    };
    
    this.state = {
      //editorState: EditorState.createWithContent(blocks, decorator),
      editorState: EditorState.createEmpty(compositeDecorator),
     // editorState: EditorState.createEmpty(),
      autocompleteState: null,
    };
    
     
   // this.analyzer();
    this.onChange = (editorState) => {

     // let currentComponent = this;
     this.setState({editorState});
    //  this.setState({editorState}, this.analyzer({editorState}));
     // this.setState(this.analyzer({editorState}));
      
      //this.analyzer()
      
     };
    this.focus = () => this.refs.editor.focus();
    this.onAutocompleteChange = (autocompleteState) => this.setState({
      autocompleteState
    });
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
  // editorState: EditorState.createWithContent(compositeDecorator)
  }
  
  componentDidMount() {
    const compositeDecorator = new CompositeDecorator([
      {
        strategy: handleStrategy,
        component: HandleSpan,
      },
      {
        strategy: hashtagStrategy,
        component: HashtagSpan,
      },
    ]);
    this.state = {
      //editorState: EditorState.createWithContent(blocks, decorator),
      editorState: EditorState.createEmpty(compositeDecorator),
     // editorState: EditorState.createEmpty(),
      autocompleteState: null,
    };

  };

  /*componentDidMount() {
    this.getBacon()
      .then(bacon => {
        this.setState({ text: bacon.join('\n\n') }, () => this.setCounts(this.state.text));
      })
      .catch(err => this.setState({ text: `Error: ${err.message}` }));

  }*/

  /*
    Fetches three parapgraphs from https://baconipsum.com/
  */
  getBacon = async () => {
    
    const response = await fetch('https://baconipsum.com/api/?type=all-meat&paras=3');
    const body = await response.json();
    
    if (response.status !== 200) 
      throw Error(body.message);

    
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
      //text: value,
      //word: words,
      charCount: trimmedValue.length,
      wordCount: value === '' ? 0 : wordsCounter.length,
      sentenceCount: value === '' ? 0 : sentences.length,
      paragraphCount: value === '' ? 0 : paragraphs.length
    });
    
  }
    
    analyzer =  ({editorState}) => {
    
   
    var request = require('request');
    //var dataString = this.state.text;
    let currentComponent = this;
    var dataString = currentComponent.state.editorState.getCurrentContent().getPlainText();
    var dataContent = currentComponent.state.editorState.getCurrentContent();
    
    //console.log(dataString);
    //() => this.setCounts(dataString)
    //var block = this.state.editorState.getCurrentContent().getBlockMap()
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

    //console.log(this.state.editorState.getCurrentContent().getPlainText());
   // console.log(this.state.editorState.getCurrentContent().getBlockMap());
    
    //const contentState = editorState.getCurrentContent();
    //const contentState = this.state.editorState.getCurrentContent();
   // let currentComponent = this;
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

       //console.log(body);

        var nerReturnedValue = JSON.parse(body);
        //console.log( nerReturnedValue);
       // console.log( nerReturnedValue.sentences[0]['tokens'][0]['word']);
        //console.log( nerReturnedValue.sentences[2]['entitymentions'].length );
        var nerValues = '';
        var offsetBeginPosition = [];
        var offsetEndPosition = [];
        var wordLength = [];
         for(var i=0; i < nerReturnedValue.sentences.length; i++){
         // console.log(i);
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
          else if(isNer && (nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "NUMBER" || 
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "DATE" || 
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "EMAIL" ||
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "TITLE" ||
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "CAUSE_OF_DEATH" ||
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "SET" ||
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "TIME"||
          nerReturnedValue.sentences[i]['tokens'][j]['ner'] == "COUNTRY"))
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
         //console.log(nerReturnedValue.sentences.length);
        // NerRecognisedEntity = [];
         for(var i=0; i < nerReturnedValue.sentences.length; i++)
         {
          
            for(var j=0; j < nerReturnedValue.sentences[i]['entitymentions'].length; j++)
            { 

          //  console.log(nerReturnedValue.sentences[i]['entitymentions'][j]['text']
          //  + '  ' +
          // nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] );
          // NerRecognisedEntity.push(nerReturnedValue.sentences[i]['entitymentions'][j]['text']);
             if(nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "NUMBER" && 
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "DATE" && 
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "EMAIL" &&
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "TITLE" &&
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "CAUSE_OF_DEATH" &&
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "SET" &&
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "TIME" &&
             nerReturnedValue.sentences[i]['entitymentions'][j]['ner'] != "COUNTRY")
              {
                NerRecognisedEntity.push(nerReturnedValue.sentences[i]['entitymentions'][j]['text']);
                console.log(nerReturnedValue.sentences[i]['entitymentions'][j]['ner']);
             }
            }

         }
         /*NerRecognisedEntityRegexValue = [];
         regexStringNer = '\\brocket\\b|\\bkolade\\b';
         if(NerRecognisedEntity.length != null) 
         {

         
            for(var i=0; i < NerRecognisedEntity.length; i++)
         
             {
           regexStringNer = '\\b'+NerRecognisedEntity[1]+'\\b';
           NerRecognisedEntityRegexValue.push('\\b'+NerRecognisedEntity[1]+'\\b')
          
             }
         }*/
        // console.log(NerRecognisedEntity.length);
         console.log(NerRecognisedEntity);
         
        // const content = currentComponent.state.editorState.getCurrentContent();
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
        const compositeDecorator = new CompositeDecorator([
          {
            strategy: handleStrategy,
            component: HandleSpan,
          },
          {
            strategy: hashtagStrategy,
            component: HashtagSpan,
          },
           ]);
       

       const blocks = convertFromRaw(rawContent);
       //const blocks = convertFromRaw(this.state.editorState.getCurrentContent());
       const plainText = 'Lorem ipsum dolor sit amet, "@kolade #consectetuer adipiscing elit. France';
       const content = ContentState.createFromText(plainText);
      //const content = ContentState.createFromText(editorState.getCurrentContent().getPlainText());
       // console.log(content.getBlockMap()._list._tail.array["0"][1]._map._root.entries);
        
       // console.log(content.getBlockMap().first());
         currentComponent.setState( {
         // word: nerValues,
         // wordCount: dataString,
         // sentenceCount: dataString,
          //editorState: editorState
         //editorState: EditorState.createEmpty(compositeDecorator),
         //editorState: EditorState.createWithContent(content)
         //editorState: EditorState.createEmpty() 
         editorState: EditorState.createWithContent(dataContent, compositeDecorator) 
          
          
        // editorState: EditorState.push(blocked)
        // editorState: EditorState.createWithContent(compositeDecorator)
       //  editorState: EditorState.createWithContent(blocks, decorator)
        //changeType: EditorChangeType
         // word: nerReturnedValue.sentences[0]['tokens'][0]['word']
        // word: nerReturnedValue.sentences[0]['entitymentions'][0]['text'] 
        // + '  ' +  nerReturnedValue.sentences[0]['entitymentions'][0]['ner']
        })
       // currentComponent.setState({editorState});
       // console.log(allUserData);
        //greeting(allUserData);
       // console.log(currentComponent.state.editorState.getCurrentContent().getBlockMap());
              }
           }
    
    request(options, callback);
    //currentComponent.setState({editorState});
     // this.onChange = (editorState) => {

     //  let currentComponent = this;
     // this.setState({editorState}, this.analyzer({editorState}));
      // this.setState(this.analyzer({editorState}));
      // currentComponent.setState({editorState});
       //this.analyzer()
       
     //  };
    
   // console.log(currentComponent.state.editorState.getCurrentContent().getBlockMap());
   const compositeDecorator = new CompositeDecorator([
    {
      strategy: handleStrategy,
      component: HandleSpan,
    },
    {
      strategy: hashtagStrategy,
      component: HashtagSpan,
    },
     ]);
    function greeting(name) {
     // tokenizeContent = name;
      //alert('Hello ' + name);
      
      }
    //  handleStrategy
  }


  handleChange = e => this.setCounts(e.target.value);
  //getAutocompleteRange(trigger)
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
   //const filteredArray = filterArray(dataArray, text.replace(regexStringNer, '')); 
   
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
        <div id="topmenu"><p><button onClick={() => this.analyzer(this.state.editorState)}>Runner</button></p></div>
        
        
        
        

         <div style={styles.root}>
            {
          this.renderAutocomplete()
                }
        <div style={styles.editor} onClick={this.focus}  >
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
        ref="editor"
        />
        </div>
        <p><button onClick={() => this.save()}>Save</button></p>
        </div>
        <p><strong>Character Count:</strong> {this.state.charCount}<br/>
        <strong>Word Count:</strong> {this.state.wordCount}<br/>
        <strong>Sentence Count:</strong> {this.state.sentenceCount}<br/>
        <strong>Paragraph Count:</strong> {this.state.paragraphCount}</p>
        </div>
    );
  }
}

function getEntityStrategy(mutability) {
  return function(contentBlock, callback, contentState) {
   /* console.log(contentBlock.getText());
    var regex = RegExp('Sarl*','g');
    const text = contentBlock.getText();
    let matchArr, start, end;
    while ((matchArr = regex.exec(text)) !== null) {
    start = matchArr.index;
    end = start + matchArr[0].length;*/
   //console.log(start);
   // console.log(end );
    
           //}
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

/**
       * Super simple decorators for handles and hashtags, for demonstration
       * purposes only. Don't reuse these regexes.
       */
      // const HANDLE_REGEX = /\@[\w]+/g;
      
     // var rocket = 'rocket';
     
     // var regexString2 = '\\b'+rocket+'\\b|\\bkolade\\b';
    // var regexString2 = '\\brocket\\b|\\bkolade\\b';
     // var regexString = regexStringNer;
     //var regexStringNew =  regexString.concat(regexString2);
     //regexString =  regexString +  regexString2;
      //const HANDLE_REGEX = RegExp(regexString, 'g');
      //const HANDLE_REGEX = regexString;
      const HANDLE_REGEX =/\brocket\b|\bkolade\b/g;
      
      const HASHTAG_REGEX = /\#[\w\u0590-\u05ff]+/g;
      
      function handleStrategy(contentBlock, callback, contentState) {
        findWithRegex(HANDLE_REGEX, contentBlock, contentState, callback);
      }
      
      function hashtagStrategy(contentBlock, callback, contentState) {
        findWithRegex2(HASHTAG_REGEX, contentBlock, callback);
      }
      
      function findWithRegex(regexTracker, contentBlock, contentState, callback) {
       
      // var regexStringNer;
       var regexStringNer2  = '\\bFrance\\b';

       /*NerRecognisedEntity = ["06/09/2018 17:39:00", "France", "Ph", "helmgale@helmgale.fr", 
       "MV SAOURA", "9.100", "Marmara", "Turkey", "September", "12th", "MV STIDIA", "9.100", 
       "Casablanca Morocco", "September 22nd", "2011/2012", "9.100", "MV TIMGAD", 
       "12.500", "Turkey", "Black Sea", "15th", "end", "2016", "12.500", "America"];*/

       if(NerRecognisedEntity.length == 0)
       {
        regexStringNer = null;
        //regexStringNer = '\\b'+NerRecognisedEntity[0]+'\\b';
       }else
       {
        for(var i=0; i < NerRecognisedEntity.length; i++)
         {
           if(i == 0)
           {
            regexStringNer = '\\b'+NerRecognisedEntity[0]+'\\b';
           }
           else
           {
            regexStringNer = regexStringNer+'|\\b'+NerRecognisedEntity[i]+'\\b';
        // console.log(NerRecognisedEntity[1]);
           }
         }

        }
        //console.log(regexStringNer);
        //console.log('\\b'+NerRecognisedEntity[1]+'\\b');
       // regexStringNer = '\\b'+NerRecognisedEntity[0]+'\\b';
       // var rocket = NerRecognisedEntity[1];
       // console.log(regexStringNer);
        const handle_regex = RegExp(regexStringNer, 'g');
        //var regexString2 = '\\brocket\\b|\\bkolade\\b';
        //const handle_regex = RegExp(regexString2, 'g');
        const text = contentBlock.getText();
       // console.log(text);
        //const text = contentState.getPlainText();
       // console.log(contentBlock);
        var text2 = '';
        let blockArray;
        //console.log(contentState.getBlocksAsArray().length);
        blockArray = contentState.getBlocksAsArray();
       /* for(var i=0; i < contentState.getBlocksAsArray().length; i++)
          {
           console.log(blockArray[i].getText());
           text2 = blockArray[i].getText();
           console.log(text2);
           }*/
        //console.log(contentState.getSelectionBefore());
          let matchArr, start;
          while ((matchArr = handle_regex.exec(text)) !== null) 
           {
          start = matchArr.index;
          callback(start, start + matchArr[0].length);
           }
        
      }

      function findWithRegex2(regex, contentBlock, callback) {
        const text = contentBlock.getText();
        let matchArr, start;
        while ((matchArr = regex.exec(text)) !== null) {
          start = matchArr.index;
          callback(start, start + matchArr[0].length);
        }
      }
      
      const HandleSpan = (props) => {
        return (
          <span
            style={styles.handle}
            data-offset-key={props.offsetKey}
            >
            {props.children}
          </span>
        );
      };
      
      const HashtagSpan = (props) => {
        return (
          <span
            style={styles.hashtag}
            data-offset-key={props.offsetKey}
            >
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

