package com.example.daon.accounting.cardTransaction.service;

import com.example.daon.accounting.cardTransaction.dto.request.CardTransactionRequest;
import com.example.daon.accounting.cardTransaction.dto.response.CardTransactionResponse;
import com.example.daon.accounting.cardTransaction.model.CardTransactionEntity;
import com.example.daon.accounting.cardTransaction.repository.CardTransactionRepository;
import com.example.daon.accounting.categorySelection.service.CategorySelectionService;
import com.example.daon.customer.model.CustomerEntity;
import com.example.daon.customer.repository.CustomerRepository;
import com.example.daon.global.exception.ResourceInUseException;
import com.example.daon.global.service.ConvertResponseService;
import com.example.daon.global.service.GlobalService;
import com.example.daon.receipts.model.FromCategory;
import com.example.daon.receipts.model.ReceiptCategory;
import com.example.daon.receipts.model.ReceiptEntity;
import com.example.daon.receipts.repository.ReceiptRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardTransactionService {
    private final CustomerRepository customerRepository;
    private final CardTransactionRepository cardTransactionRepository;
    private final ReceiptRepository receiptRepository;
    private final CategorySelectionService categorySelectionService;
    private final ConvertResponseService convertResponseService;
    private final GlobalService globalService;

    //카드결제내역
    public void saveCardTransaction(CardTransactionRequest cardTransactionRequest) {
        CustomerEntity customer = customerRepository.findById(cardTransactionRequest.getCustomerId()).orElseThrow(() -> new RuntimeException("잘못된 고객 아이디입니다."));
        categorySelectionService.findAndSave(cardTransactionRequest.getCategorySelection());
        CardTransactionEntity cardTransaction = cardTransactionRepository.save(cardTransactionRequest.toCardTransactionEntity(customer));
        cardTransactionRequest.setCardTransactionId(cardTransaction.getCardTransactionId());
    }

    public void updateCardTransaction(CardTransactionRequest cardTransactionRequest) {
        CardTransactionEntity cardTransaction = cardTransactionRepository.findById(cardTransactionRequest.getCardTransactionId()).orElse(null);
        CustomerEntity customer = customerRepository.findById(cardTransactionRequest.getCustomerId()).orElseThrow(() -> new RuntimeException("잘못된 고객 아이디입니다."));
        cardTransaction.updateFields(cardTransactionRequest, customer);
    }

    public void deleteCardTransaction(CardTransactionRequest cardTransactionRequest) {
        try {
            cardTransactionRepository.deleteById(cardTransactionRequest.getCardTransactionId());
            cardTransactionRepository.flush();
        } catch (Exception e) {
            throw new ResourceInUseException("카드결제내역을 삭제할 수 없습니다. 관련된 데이터가 존재합니다.", e);
        }
    }

    public List<CardTransactionResponse> getCardTransaction(CardTransactionRequest cardTransactionRequest) {
        List<CardTransactionEntity> cardTransactionEntities = cardTransactionRepository.findAll((root, query, criteriaBuilder) -> {
            //조건문 사용을 위한 객체
            List<Predicate> predicates = new ArrayList<>();

            if (cardTransactionRequest.getCardTransactionId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("cardTransactionId"), cardTransactionRequest.getCardTransactionId()));
            } else {
                if (cardTransactionRequest.getSearchSDate() != null && cardTransactionRequest.getSearchEDate() != null) {
                    predicates.add(criteriaBuilder.between(root.get("date"), cardTransactionRequest.getSearchSDate(), cardTransactionRequest.getSearchEDate()));
                }

                if (cardTransactionRequest.getCustomerName() != null) {
                    predicates.add(criteriaBuilder.like(root.get("customerId").get("customerName"), "%" + cardTransactionRequest.getCustomerName() + "%"));
                }
            }
            // 동적 조건을 조합하여 반환
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        return cardTransactionEntities.stream().map(convertResponseService::convertToCardTransactionResponse).collect(Collectors.toList());
    }

    public void paidCardTransaction(CardTransactionRequest cardTransactionRequest) {
        CardTransactionEntity cardTransaction = cardTransactionRepository.findById(cardTransactionRequest.getCardTransactionId()).orElse(null);
        cardTransaction.setPaid(!cardTransaction.isPaid());

        if (cardTransaction.isPaid()) {
            ReceiptEntity receipt = receiptRepository.save(new ReceiptEntity(
                    null,
                    null,
                    LocalDateTime.now(),
                    ReceiptCategory.DEPOSIT,
                    cardTransaction.getCustomerId(),
                    null,
                    null,
                    1,
                    cardTransaction.getTotal(),
                    cardTransaction.getPaymentDetails(),
                    cardTransaction.getMemo(),
                    FromCategory.SALES));
            cardTransaction.setReceiptId(receipt.getReceiptId());
            cardTransaction.setPaidDate(cardTransactionRequest.getPaidDate());
            globalService.updateDailyTotal(receipt.getTotalPrice(), receipt.getCategory(), receipt.getTimeStamp());
        } else {
            cardTransactionRequest.setReceiptId(cardTransaction.getReceiptId());
            ReceiptEntity receipt = receiptRepository.findById(cardTransaction.getReceiptId()).orElseThrow(() -> new RuntimeException("전표가 존재하지 않습니다."));
            globalService.updateDailyTotal(receipt.getTotalPrice().negate(), receipt.getCategory(), receipt.getTimeStamp());
            receiptRepository.deleteById(cardTransaction.getReceiptId());
            cardTransaction.setReceiptId(null);
            cardTransaction.setPaidDate(null);
        }

        cardTransactionRepository.save(cardTransaction);

    }
}
