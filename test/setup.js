import Enzyme from "enzyme"

// TODO: use Adapter from NPM once "unknown node with tag 12/13" bug is fixed and remove adapter-bugfix
//import Adapter from "enzyme-adapter-react-16"
import Adapter from './adapter-bugfix'

Enzyme.configure({ adapter: new Adapter() });

const { JSDOM } = require("jsdom");

const jsdom = new JSDOM('<!doctype html><html><body></body></html>');
const { window } = jsdom;

function copyProps(src, target) {
    const props = Object.getOwnPropertyNames(src)
        .filter(prop => typeof target[prop] === 'undefined')
        .reduce((result, prop) => ({
            ...result,
            [prop]: Object.getOwnPropertyDescriptor(src, prop),
        }), {});
    Object.defineProperties(target, props);
}

global.window = window;
global.document = window.document;
global.navigator = {
    userAgent: 'node.js',
};

global.__DEV = true;
global.__PROD = false;

copyProps(window, global);
