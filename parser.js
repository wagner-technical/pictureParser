'use strict'

let pythonBridge = require('python-bridge');
 
const Picture = require("./Picture.js");
const fs = require("fs");

let python = pythonBridge();

python.ex`import tkinter as tk`
python.ex`from tkinter import filedialog`
python.ex`root = tk.Tk()`
python.ex`root.withdraw()`

let names = {}
const getUniqName = name => {
  names.hasOwnProperty(name)  
  ? names[name].amount += 1
  : names[name] = {amount: 1}
  return `${name} (${names[name].amount}).jpg`
} 

const parse = async function() {
  const initDir = require('./config/fileScheme').initialDirectoryDialog
  let path = await python`filedialog.askdirectory(initialdir=${initDir})`//.then(x=>console.log(x))
  console.log('Parsing '+path+'...')
  let pictures = [], picture, currentName
  let files = fs.readdirSync(path)  
  
  for (let i=0; i < files.length; i++) {
    picture = new Picture(path, files[i])
    const isPic = await picture.parse()
    if (isPic !== null) pictures.push(picture)
  }
  
  pictures
  .sort( (prev, curr) => prev.fsStats.mtimeMs - curr.fsStats.mtimeMs)
  .forEach(pic => {
    if (pic.isScreenshot) {
      pic.getPath()
      currentName = path + pic.newPath + pic.name
    } pic.name = getUniqName(currentName)
  })
  
  pictures.forEach(pic=>{
    fs.rename(pic.path, pic.name, err=> {
      if (err) console.log(err)
    })
  })
  
};

parse()

python.end();