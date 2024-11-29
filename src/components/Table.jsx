import React, { useState } from 'react';
import { initialData } from './dummy';

const Table = () => {
  const [data, setData] = useState(() => ({
    rows: initialData.rows.map((row) => ({
      ...row,
      originalValue: row.value,
      children: row.children.map((child) => ({
        ...child,
        originalValue: child.value,
      })),
    })),
  }));
  console.log(data,"iniitialdata")
  const [input, setInput] = useState({});

  const handleInputChange = (id, value) => {
    setInput((prev) => ({
      ...prev,
      [id]: value,
    }));
  };
  const calculateVariance = (original, current) => {
    if (!original) return null;
    return ((current - original) / original) * 100;
  };
  
  const handleAllocationPercent = (id) => {
    setData((prev) => {
      const updatedRows = prev.rows.map((row) => {
        if (row.id === id) {
          const percentage = parseFloat(input[id] || 0);
          const updatedValue = row.value + (row.value * percentage) / 100;
          const parentVariance = calculateVariance(row.originalValue, updatedValue);
          const numChildren = row.children.length;
  
          if (numChildren) {
            const totalCurrentChildValue = row.children.reduce(
              (sum, child) => sum + child.value,
              0
            );
  
            const updatedChildren = row.children.map((child) => {
              const proportion =
                totalCurrentChildValue === 0
                  ? 1 / numChildren
                  : child.value / totalCurrentChildValue;
  
              const updatedChildValue = updatedValue * proportion;
              return {
                ...child,
                value: updatedChildValue,
                variance: parentVariance, // Apply parent's variance to child
              };
            });
  
            return {
              ...row,
              value: updatedValue,
              variance: parentVariance,
              children: updatedChildren,
            };
          }
          return {
            ...row,
            value: updatedValue,
            variance: parentVariance,
          };
        }
        const updatedChildren = row.children.map((child) => {
          if (child.id === id) {
            const percentage = parseFloat(input[id] || 0);
            const updatedValue = child.value + (child.value * percentage) / 100;
            return {
              ...child,
              value: updatedValue,
              variance: calculateVariance(child.originalValue, updatedValue),
            };
          }
          return child;
        });
        const isChildUpdated = updatedChildren.some(
          (child, index) => child.value !== row.children[index]?.value
        );
        if (isChildUpdated) {
          const updatedParentValue = updatedChildren.reduce(
            (sum, child) => sum + child.value,
            0
          );
          const parentVariance = calculateVariance(row.originalValue, updatedParentValue);
          return {
            ...row,
            value: updatedParentValue,
            variance: parentVariance,
            children: updatedChildren,
          };
        }
        return row;
      });
      return { ...prev, rows: updatedRows };
    });
  };
  const handleAllocationValue = (id) => {
    setData((prev) => {
      const updatedRows = prev.rows.map((row) => {
        if (row.id === id) {
          const newValue = parseFloat(input[id] || 0);
          const parentVariance = calculateVariance(row.originalValue, newValue);
          const numChildren = row.children.length;
  
          if (numChildren > 0) {
            const totalCurrentValue = row.children.reduce(
              (sum, child) => sum + child.value,
              0
            );
            const updatedChildren = row.children.map((child) => {
              const proportion =
                totalCurrentValue === 0
                  ? 1 / numChildren
                  : child.value / totalCurrentValue;
  
              const updatedChildValue = newValue * proportion;
              return {
                ...child,
                value: updatedChildValue,
                variance: parentVariance, // Apply parent's variance to child
              };
            });
  
            return {
              ...row,
              value: newValue,
              variance: parentVariance,
              children: updatedChildren,
            };
          }
          return {
            ...row,
            value: newValue,
            variance: parentVariance,
          };
        }
        const updatedChildren = row.children.map((child) => {
          if (child.id === id) {
            const newValue = parseFloat(input[id] || 0);
            return {
              ...child,
              value: newValue,
              variance: calculateVariance(child.originalValue, newValue),
            };
          }
          return child;
        });
        const isChildUpdated = updatedChildren.some(
          (child, index) => child.value !== row.children[index]?.value
        );
        if (isChildUpdated) {
          const updatedParentValue = updatedChildren.reduce(
            (sum, child) => sum + child.value,
            0
          );
          const parentVariance = calculateVariance(row.originalValue, updatedParentValue);
          return {
            ...row,
            value: updatedParentValue,
            variance: parentVariance,
            children: updatedChildren,
          };
        }
  
        return row;
      });
  
      return { ...prev, rows: updatedRows };
    });
  };
  const calculateTotal = ()=>{
    const totalValue = data.rows.reduce((sum,row) => sum + row.value,0)
    return totalValue.toFixed(2)
  }
  

  return (
    <table className="table table-striped table-bordered">
      <thead>
        <tr>
          <th>LABEL</th>
          <th>VALUE</th>
          <th>INPUT</th>
          <th>ALLOCATION %</th>
          <th>ALLOCATION VALUE</th>
          <th>VARIANCE %</th>
        </tr>
      </thead>
      <tbody>
        {data.rows.map((row) => (
          <React.Fragment key={row.id}>
            <tr>
              <td>{row.label}</td>
              <td>{row.value.toFixed(2)}</td>
              <td>
                <input
                  type="number"
                  value={input[row.id] || ''}
                  onChange={(e) => handleInputChange(row.id, e.target.value)}
                />
              </td>
              <td>
                <button onClick={() => handleAllocationPercent(row.id)}>ALLOCATION %</button>
              </td>
              <td>
                <button onClick={() => handleAllocationValue(row.id)}>ALLOCATION VALUE</button>
              </td>
              <td>
                {calculateVariance(row.originalValue, row.value)?.toFixed(2)}%
              </td>
            </tr>
            {row.children.map((child) => (
              <tr key={child.id}>
                <td>-- {child.label}</td>
                <td>{child.value.toFixed(2)}</td>
                <td>
                  <input
                    type="number"
                    value={input[child.id] || ''}
                    onChange={(e) => handleInputChange(child.id, e.target.value)}
                  />
                </td>
                <td>
                  <button onClick={() => handleAllocationPercent(child.id)}>
                    ALLOCATION %
                  </button>
                </td>
                <td>
                  <button onClick={() => handleAllocationValue(child.id)}>
                    ALLOCATION VALUE
                  </button>
                </td>
                <td>
                  {calculateVariance(child.originalValue, child.value)?.toFixed(2)}%
                </td>
              </tr>
            ))}
          </React.Fragment>
        ))}
      </tbody>
      <tfoot>
      <tr className='grand-total'>
                        <td>Grand Total:</td>
                        <td colSpan="5">{calculateTotal()}</td> 
                    </tr>
      </tfoot>
    </table>
  );
};

export default Table;








