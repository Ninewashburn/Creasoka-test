import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Bold, Italic, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RichTextEditorProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({
  id,
  label,
  value,
  onChange,
  required = false,
  placeholder = 'Écrivez votre texte...',
  className
}: RichTextEditorProps) {
  const [text, setText] = useState(value || '');

  // Synchroniser avec la prop value externe
  useEffect(() => {
    setText(value || '');
  }, [value]);

  // Convertir le texte en HTML simple
  const processTextToHtml = (text: string): string => {
    // Balises supportées : **bold**, *italic*, - list item
    let html = text;
    
    // Convertir les astérisques doubles en balises strong
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convertir les astérisques simples en balises em
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convertir les lignes commençant par "- " en items de liste
    html = html.replace(/^- (.*?)$/gm, '<li>$1</li>');
    
    // Entourer les balises li consécutives avec ul
    if (html.includes('<li>')) {
      html = html.replace(/(<li>.*?<\/li>)+/g, '<ul>$&</ul>');
    }
    
    // Convertir les sauts de ligne en <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
  };

  // Convertir l'HTML simple en texte formaté
  const processHtmlToText = (html: string): string => {
    let text = html;
    
    // Convertir les balises strong en **bold**
    text = text.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    
    // Convertir les balises em en *italic*
    text = text.replace(/<em>(.*?)<\/em>/g, '*$1*');
    
    // Convertir les balises li en "- item"
    text = text.replace(/<li>(.*?)<\/li>/g, '- $1\n');
    
    // Supprimer les balises ul
    text = text.replace(/<\/?ul>/g, '');
    
    // Convertir <br> en sauts de ligne
    text = text.replace(/<br>/g, '\n');
    
    return text;
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = e.target.value;
    setText(newText);
    onChange(newText);
  };

  const formatText = (format: 'bold' | 'italic' | 'list') => {
    const textarea = document.getElementById(id) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    let replacement = '';
    let offset = 0;

    switch (format) {
      case 'bold':
        replacement = `**${selectedText}**`;
        offset = 2;
        break;
      case 'italic':
        replacement = `*${selectedText}*`;
        offset = 1;
        break;
      case 'list':
        // Ajouter "- " au début de chaque ligne
        replacement = selectedText
          .split('\n')
          .map(line => line.trim() ? `- ${line}` : line)
          .join('\n');
        offset = 0;
        break;
    }

    const newText = 
      textarea.value.substring(0, start) + 
      replacement + 
      textarea.value.substring(end);
    
    setText(newText);
    onChange(newText);
    
    // Remettre le focus et repositionner le curseur
    setTimeout(() => {
      textarea.focus();
      if (selectedText) {
        textarea.setSelectionRange(
          start, 
          start + replacement.length
        );
      } else {
        textarea.setSelectionRange(
          start + offset, 
          start + offset
        );
      }
    }, 0);
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Label
        htmlFor={id}
        className="text-base font-medium flex items-center"
      >
        {label} {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      <div className="flex flex-col border rounded-md overflow-hidden focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <div className="bg-muted p-1 border-b flex gap-1">
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 py-1"
            onClick={() => formatText('bold')}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 py-1"
            onClick={() => formatText('italic')}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 py-1"
            onClick={() => formatText('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
        <textarea
          id={id}
          value={text}
          onChange={handleChange}
          placeholder={placeholder}
          className="min-h-[150px] p-3 resize-y border-0 focus-visible:ring-0 focus-visible:outline-none"
          required={required}
        />
      </div>
      
      <div className="text-sm text-muted-foreground">
        Utilisez <strong>**gras**</strong>, <em>*italique*</em> et <span>- liste à puces</span> pour mettre en forme votre texte
      </div>
    </div>
  );
} 