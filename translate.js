import dictionary from 'json!./i18n/ru.json';

export default (text) => {
   if (dictionary[text]) {
       return dictionary[text];
   }
    return text;
}