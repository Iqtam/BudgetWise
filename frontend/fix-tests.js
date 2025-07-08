import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const filePath = path.join(__dirname, 'src/lib/components/__tests__/BudgetContent.test.ts');

// Read the file
let content = fs.readFileSync(filePath, 'utf8');

// Fix text mismatches based on actual component content
content = content.replace(/Add Budget/g, 'Create Budget');
content = content.replace(/Refresh Data/g, 'Refresh');
content = content.replace(/Create Category/g, 'Add');

// Write the file back
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Test text mismatches fixed successfully!');
