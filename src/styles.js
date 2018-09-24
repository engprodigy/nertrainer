const styles = {
   root: {
    //width: 600,
    width: '100%',
    padding: 40,
    fontFamily: 'HelveticaNeue-Light',
    margin: 'auto',
    fontSize: '15pt'
  },
 editor: {
    borderRadius: 4,
    minHeight: 30,
    padding: 10,
    border: '1px solid #ccc',
    //background: '#2b303b',
   // color: '#85939f'
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
    color: 'black',
    borderRadius: 3
  },
  link: {
   // color: '#a7b5bf'
  },
  button: {
    marginTop: 10,
    textAlign: 'center',
  },
  immutable: {
    //backgroundColor: 'rgba(0, 0, 0, 0.2)',
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
};

export default styles;