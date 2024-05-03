import React, { useState } from "react";
import { Col, Form, Row, Table, Button } from "react-bootstrap";

// Define a custom type alias for the form control element
type FormControlElement =
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

const HomeLoanCalculator: React.FC = () => {
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [interestRate, setInterestRate] = useState<number>(0);
  const [tenure, setTenure] = useState<number>(0);
  const [tableData, setTableData] = useState<any[]>([]);

  const handleLoanAmountChange = (e: React.ChangeEvent<FormControlElement>) => {
    setLoanAmount(parseFloat(e.target.value));
  };

  const handleInterestRateChange = (
    e: React.ChangeEvent<FormControlElement>,
  ) => {
    setInterestRate(parseFloat(e.target.value));
  };

  const handleTenureChange = (e: React.ChangeEvent<FormControlElement>) => {
    setTenure(parseInt(e.target.value));
  };

  const handleCalculate = () => {
    generateTableData();
  };

  const generateTableData = () => {
    const monthlyInterestRate = interestRate / 12 / 100;
    const totalMonths = tenure * 12;
    let outstandingBalance = loanAmount;
    const emi = calculateEMI(loanAmount, interestRate, tenure);
    const data = [];
    for (let i = 1; i <= totalMonths; i++) {
      const monthlyInterest = outstandingBalance * monthlyInterestRate;
      let principle = emi - monthlyInterest;
      // Adjust principle for the last month
      if (i === totalMonths) {
        principle = outstandingBalance;
      }
      let previousOutstandingBalance = loanAmount;
      if (i > 1) {
        const previousRow = data[i - 2]; // Access the previous row properly

        if (previousRow) {
          previousOutstandingBalance = parseFloat(
            previousRow.OutstandingBalance,
          );
        }
      }

      // Calculate the outstanding balance
      const prepayment = 0;
      outstandingBalance = previousOutstandingBalance - principle - prepayment;

      data.push({
        Month: i,
        EMI: emi.toFixed(2),
        Principle: principle.toFixed(2),
        Interest: monthlyInterest.toFixed(2),
        OutstandingBalance: outstandingBalance.toFixed(2),
        Prepayment: 0,
      });
    }
    setTableData(data);
  };

  const handlePrepaymentChange = (
    e: React.ChangeEvent<FormControlElement>,
    month: number,
  ) => {
    const newData = tableData.map((row, index) => {
      if (index === month - 1) {
        return { ...row, Prepayment: parseFloat(e.target.value) || 0 }; // Convert to number
      }
      return row;
    });

    // Update subsequent rows
    for (let i = month; i < newData.length; i++) {
      const previousRow = newData[i - 1];
      const emi = parseFloat(previousRow.EMI);
      const interest = parseFloat(previousRow.Interest);
      const principle = parseFloat(previousRow.Principle); // Use the principle from the previous row
      const prepayment = parseFloat(previousRow.Prepayment);
      const outstandingBalance =
        parseFloat(previousRow.OutstandingBalance) - principle - prepayment; // Deduct both principle and prepayment from the current month's outstanding balance
      newData[i] = {
        ...newData[i],
        EMI: emi.toFixed(2),
        Principle: principle.toFixed(2), // Keep the principle unchanged
        Interest: interest.toFixed(2),
        OutstandingBalance: outstandingBalance.toFixed(2),
      };
    }

    setTableData(newData);
  };

  const calculateEMI = (
    loanAmount: number,
    interestRate: number,
    tenure: number,
  ) => {
    const monthlyInterestRate = interestRate / 12 / 100;
    const totalMonths = tenure * 12;
    return (
      (loanAmount *
        monthlyInterestRate *
        Math.pow(1 + monthlyInterestRate, totalMonths)) /
      (Math.pow(1 + monthlyInterestRate, totalMonths) - 1)
    );
  };

  return (
    <>
      <Row>
        <Form.Label column lg={2}>
          Loan Amount
        </Form.Label>
        <Col>
          <Form.Control
            type="text"
            placeholder="Loan Amount"
            onChange={handleLoanAmountChange}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Form.Label column lg={2}>
          Interest Rate (%)
        </Form.Label>
        <Col>
          <Form.Control
            type="text"
            placeholder="Interest Rate"
            onChange={handleInterestRateChange}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Form.Label column lg={2}>
          Tenure (Years)
        </Form.Label>
        <Col>
          <Form.Control
            type="text"
            placeholder="Tenure"
            onChange={handleTenureChange}
          />
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Button onClick={handleCalculate}>Calculate</Button>
        </Col>
      </Row>
      <br />
      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Month</th>
                <th>EMI</th>
                <th>Principle</th>
                <th>Interest</th>
                <th>Outstanding Balance</th>
                <th>Prepayment</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((data, index) => (
                <tr key={index}>
                  <td>{data.Month}</td>
                  <td>{data.EMI}</td>
                  <td>{data.Principle}</td>
                  <td>{data.Interest}</td>
                  <td>{data.OutstandingBalance}</td>
                  <td>
                    <Form.Control
                      type="text"
                      placeholder="Prepayment"
                      value={data.Prepayment}
                      onChange={(e: React.ChangeEvent<FormControlElement>) =>
                        handlePrepaymentChange(e, data.Month)
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Col>
      </Row>
    </>
  );
};

export default HomeLoanCalculator;
