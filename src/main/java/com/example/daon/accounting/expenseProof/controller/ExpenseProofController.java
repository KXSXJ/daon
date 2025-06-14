package com.example.daon.accounting.expenseProof.controller;

import com.example.daon.accounting.expenseProof.dto.request.ExpenseProofRequest;
import com.example.daon.accounting.expenseProof.dto.response.ExpenseProofResponse;
import com.example.daon.accounting.expenseProof.service.ExpenseProofService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ExpenseProofController {

    private final ExpenseProofService expenseProofService;

    //지출증빙->전표전환
    @PostMapping("api/saveExpenseProof")
    public void saveExpenseProof(@RequestBody ExpenseProofRequest expenseProofRequest) {
        expenseProofService.saveExpenseProof(expenseProofRequest);
    }

    @PostMapping("api/updateExpenseProof")
    public void updateExpenseProof(@RequestBody ExpenseProofRequest expenseProofRequest) {
        expenseProofService.updateExpenseProof(expenseProofRequest);
    }

    @PostMapping("api/deleteExpenseProof")
    public void deleteExpenseProof(@RequestBody ExpenseProofRequest expenseProofRequest) {
        expenseProofService.deleteExpenseProof(expenseProofRequest);
    }

    @GetMapping("api/getAllExpenseProof")
    public List<ExpenseProofResponse> getAllExpenseProof() {
        return expenseProofService.getExpenseProof(new ExpenseProofRequest());
    }

    @PostMapping("api/getExpenseProof")
    public List<ExpenseProofResponse> getExpenseProof(@RequestBody ExpenseProofRequest expenseProofRequest) {
        return expenseProofService.getExpenseProof(expenseProofRequest);
    }

    @PostMapping("api/paidExpenseProof")
    public void paidExpenseProof(@RequestBody ExpenseProofRequest expenseProofRequest) {
        expenseProofService.paidExpenseProof(expenseProofRequest);
    }
}
