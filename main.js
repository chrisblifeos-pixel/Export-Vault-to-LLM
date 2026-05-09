const obsidian = require('obsidian');

class LLMExportPlugin extends obsidian.Plugin {
    async onload() {
        // Add an icon to the left ribbon
        this.addRibbonIcon('combine', 'Export Vault for LLM', async (evt) => {
            await this.exportVaultForLLM();
        });
    }

    async exportVaultForLLM() {
        new obsidian.Notice('Starting LLM export...');

        try {
            const { vault } = this.app;
            // Get all markdown files in the vault
            const files = vault.getMarkdownFiles();

            let combinedContent = '# Vault Export for LLM\n\n';
            const outputFolderName = 'LLM Output';
            const outputFileName = `${outputFolderName}/Output.md`;

            // Filter out the output file itself to prevent recursive duplication loops
            const filesToProcess = files.filter(f => f.path !== outputFileName);

            // Iterate through files, read them, and append to the combined string
            for (const file of filesToProcess) {
                const content = await vault.read(file);
                
                // Add clear delimiters and the file path so the LLM knows the context
                combinedContent += `\n\n---\n## File: ${file.path}\n\n`;
                combinedContent += content;
            }

            // Check if 'LLM Output' folder exists; if not, create it
            const folderExists = await vault.adapter.exists(outputFolderName);
            if (!folderExists) {
                await vault.createFolder(outputFolderName);
            }

            // Check if 'Output.md' exists to modify it, otherwise create a new file
            const fileExists = await vault.adapter.exists(outputFileName);
            if (fileExists) {
                const existingFile = vault.getAbstractFileByPath(outputFileName);
                await vault.modify(existingFile, combinedContent);
            } else {
                await vault.create(outputFileName, combinedContent);
            }

            new obsidian.Notice('Vault export complete! Check the "LLM Output" folder.');
        } catch (error) {
            console.error('LLM Export Error:', error);
            new obsidian.Notice('Error exporting vault. Check developer console for details.');
        }
    }

    onunload() {
        // Cleanup resources if necessary when the plugin is disabled
    }
}

module.exports = LLMExportPlugin;
