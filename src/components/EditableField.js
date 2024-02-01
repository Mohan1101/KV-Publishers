import React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

class EditableField extends React.Component {
  render() {
    const { cellData, onItemizedItemEdit } = this.props;

    if (cellData.type === 'select') {
      return (
        <InputGroup className="my-1 flex-nowrap">
          {cellData.leading != null && (
            <InputGroup.Text className="bg-light fw-bold border-0 text-secondary px-2">
              <span
                className="border border-2 border-secondary rounded-circle d-flex align-items-center justify-content-center small"
                style={{ width: '20px', height: '20px' }}
              >
                {cellData.leading}
              </span>
            </InputGroup.Text>
          )}
          <Form.Select
            className={cellData.textAlign}
            name={cellData.name}
            id={cellData.id}
            value={cellData.value}
            aria-label={cellData.name}
            onChange={(e) => onItemizedItemEdit(e, cellData)}
            required
          >
            <option value="">{cellData.placeholder}</option>
            {cellData.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Form.Select>
        </InputGroup>
      );
    }

    // Handle other input types (text, number, etc.) here...

    return (
      <InputGroup className="my-1 flex-nowrap">
        {cellData.leading != null && (
          <InputGroup.Text className="bg-light fw-bold border-0 text-secondary px-2">
            <span
              className="border border-2 border-secondary rounded-circle d-flex align-items-center justify-content-center small"
              style={{ width: '20px', height: '20px' }}
            >
              {cellData.leading}
            </span>
          </InputGroup.Text>
        )}
        <Form.Control
          className={cellData.textAlign}
          type={cellData.type}
          placeholder={cellData.placeholder}
          min={cellData.min}
          name={cellData.name}
          id={cellData.id}
          value={cellData.value}
          step={cellData.step}
          precision={cellData.precision}
          aria-label={cellData.name}
          onChange={onItemizedItemEdit}
          required
        />
      </InputGroup>
    );
  }
}

export default EditableField;
