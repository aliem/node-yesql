'use strict';

const debug = require('debug')('rivermill:database:load');
const R = require('ramda');

const readFile = require('fs').readFileSync;

const splitStatements = R.split(/(?:\n|\r\n|\r){2}/g);
const splitByLine = R.pipe(
    R.split(/(?:\n|\r\n|\r)/g),
    R.filter(R.length));

const getName = R.pipe(
    R.match(/^-- *name: *([a-zA-Z_$]+)$/),
    R.nth(1),
    R.trim);

const getParams = R.compose(
    R.slice(0, Infinity),
    R.match(/[$@:][a-zA-Z_]+/g));

const cleanComments = R.replace(/^-- */, '');

const joint = R.pipe(
    R.filter(R.pipe(R.test(/^-- .*/), R.not)),
    R.filter(R.length),
    R.join('\n'));

const prop = (value) => ({ enumerable: true, value });

function parsePart(part) {
    const lines = splitByLine(part);
    const name = getName(lines.shift());
    const description = cleanComments(lines.shift());
    const sql = joint(lines);
    const params = getParams(sql);

    return {
        name,
        sql,
        description,
        params,
    };
}

function load(run, filename) {
    const sql = readFile(filename, 'utf-8');
    const parts = splitStatements(sql);
    const statements = parts.map(parsePart);

    const list = {};
    statements.forEach((part) => {
        const name = part.name;

        debug(`Exporting function '${name}'`);

        if (list.hasOwnProperty(name)) {
            throw new Error(
                `Parse Error: SQL Function '${name}' in file '${filename}' already declared!`);
        }

        list[name] = run(part.sql);
        Object.defineProperties(
            list[name], {
                sql: prop(part.sql),
                description: prop(part.description),
                params: prop(part.params),
                arity: prop(part.params.length),
                _name: prop(name),
            });
    });

    return list;
}

module.exports = load;
