This project was bootstrapped with [Create React App](https://github.com/facebookincubator/create-react-app).


# engprodigy.github.io-ner-trainer
AI NER Trainer React App.


An NLP (Natural Language Processing) tools for intelligent analysis of text based on the Named Entity Recognition (NER) tool. NER labels sequences of words in a text which are the names of things, persons, company names, location and places. 

This application was engineered for NER analysis of shipping emails send by brokers and chaterers to quickly identify ship names, built year, arrival port, arrival date and other important information contained in emails they send to each other.


It comes with well-engineered feature extractors for Named Entity Recognition, and many options for defining feature extractors.

This is a sample of the code for analysis and feature purpose. Full code base is on company internal SVN repository. I can't show here because of privacy and intellectual property issues.

The blue highlighted text clolor where identified by the AI as shipping words (like departure date, arrival date, ship name) as initially trained by us. 

![ner_trainer](https://user-images.githubusercontent.com/1181072/51521552-31d34d00-1e27-11e9-8aa8-ec27f778ea58.png)

It also automates training process to generate your own CRF clasiffiers
https://nlp.stanford.edu/software/CRF-NER.html
https://nlp.stanford.edu/software/crf-faq.shtml
