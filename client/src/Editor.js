import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useMemo } from 'react';

const Editor = ({ value, onChange }) => {
  const modules = useMemo(() => ({
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image'],
      ['clean'],
    ],
    clipboard: {
      matchVisual: false,
    }
  }), []);

  return (
    <ReactQuill
      value={value}
      theme="snow"
      onChange={onChange}
      modules={modules}
      style={{ minHeight: '200px' }}
    />
  );
};

export default Editor;