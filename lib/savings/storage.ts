import {Data,emptyData,validateData} from './model';
export const STORAGE_KEY='skarbn ychka:v1'.replace(' ','');
export function readData():Data{const raw=localStorage.getItem(STORAGE_KEY);return raw?validateData(JSON.parse(raw)):structuredClone(emptyData)}
export function saveData(d:Data){const value=validateData(d);localStorage.setItem(STORAGE_KEY,JSON.stringify(value))}
