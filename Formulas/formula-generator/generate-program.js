// Generate Program from Formulas - CLI Tool
// BRANDING: .T. TogetherSystems - ModularFlux Architecture
// VERSION: 3.0.0

const CodeGenerator = require('./code-generator');
const FormulaGraph = require('./formula-graph');

const formulaIds = process.argv.slice(2).filter(arg => !arg.startsWith('--'));
const language = process.argv.find(arg => arg.startsWith('--lang='))?.split('=')[1] || 'python';
const outputDir = process.argv.find(arg => arg.startsWith('--output='))?.split('=')[1] || './generated';

console.log('═══════════════════════════════════════════════════════════');
console.log('  FORMULA PROGRAM GENERATOR');
console.log('  Version: 3.0.0');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

if (formulaIds.length === 0) {
  console.error('❌ Keine Formeln angegeben');
  console.log('');
  console.log('Verwendung:');
  console.log('  node generate-program.js F000001 F000002 --lang=python --output=./generated');
  console.log('');
  process.exit(1);
}

console.log(`📊 Formeln: ${formulaIds.join(', ')}`);
console.log(`🌐 Sprache: ${language}`);
console.log(`📁 Output: ${outputDir}`);
console.log('');

try {
  const generator = new CodeGenerator();
  const result = generator.generate(formulaIds, language, outputDir);

  console.log('✅ Programm generiert!');
  console.log(`   Typ: ${result.programType}`);
  console.log(`   Datei: ${result.filepath}`);
  console.log('');
  console.log('📄 Code:');
  console.log('─'.repeat(60));
  console.log(result.code);
  console.log('─'.repeat(60));
  console.log('');

  // Zeige Graph-Info
  const graph = new FormulaGraph();
  graph.loadFormulas();
  graph.buildGraph(formulaIds);
  
  console.log('📊 Graph-Info:');
  console.log(`   Knoten: ${graph.graph.nodes.length}`);
  console.log(`   Kanten: ${graph.graph.edges.length}`);
  console.log(`   Eingaben: ${graph.graph.inputs.length}`);
  console.log(`   Ausgaben: ${graph.graph.outputs.length}`);
  console.log('');

} catch (e) {
  console.error('❌ Fehler:', e.message);
  process.exit(1);
}


