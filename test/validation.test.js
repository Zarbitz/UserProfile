import test from 'node:test';
import assert from 'node:assert/strict';
import {assetInput,enquiryInput} from '../src/validation.js';
test('rejects invalid geographic coordinates and unclosed boundaries',()=>{for(const geometry of [{type:'Point',coordinates:[181,0]},{type:'Point',coordinates:[0,-91]},{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,1]]]}])assert.equal(assetInput.safeParse({name:'A',service:'dams',geometry}).success,false);});
test('accepts a closed polygon and rejects unsupported services',()=>{const asset={name:'Parcel',service:'agri',geometry:{type:'Polygon',coordinates:[[[0,0],[1,0],[1,1],[0,0]]]}};assert.equal(assetInput.safeParse(asset).success,true);assert.equal(assetInput.safeParse({...asset,service:'admin'}).success,false);});
test('enquiries require a real email and meaningful requirements',()=>{assert.equal(enquiryInput.safeParse({name:'A',email:'invalid',solution:'Agri',location:'India',message:'short'}).success,false);});
