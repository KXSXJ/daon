package com.example.daon.accounting.salesVAT.service;

import com.example.daon.accounting.categorySelection.service.CategorySelectionService;
import com.example.daon.accounting.salesVAT.dto.request.SalesVATRequest;
import com.example.daon.accounting.salesVAT.dto.response.SalesVATResponse;
import com.example.daon.accounting.salesVAT.model.SalesVATEntity;
import com.example.daon.accounting.salesVAT.repository.SalesVATRepository;
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
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class SalesVATService {

    private final SalesVATRepository salesVATRepository;
    private final CustomerRepository customerRepository;
    private final ReceiptRepository receiptRepository;
    private final CategorySelectionService categorySelectionService;
    private final ConvertResponseService convertResponseService;
    private final GlobalService globalService;

    //매출부가세
    public void saveSalesVAT(SalesVATRequest salesVATRequest) {
        CustomerEntity customer = customerRepository.findById(salesVATRequest.getCustomerId()).orElseThrow(() -> new RuntimeException("존재하지 않는 고객입니다."));
        categorySelectionService.findAndSave(salesVATRequest.getCategorySelection());
        SalesVATEntity salesVATEntity = salesVATRepository.save(salesVATRequest.toSalesVATEntity(customer));
        salesVATRequest.setSalesVATId(salesVATEntity.getSalesVATId()); //ㄴㄴ 그건 너가 보낸게 있고 생성은 null이라 임의 지정 해야ㅑ함
    }

    public void updateSalesVAT(SalesVATRequest salesVATRequest) {
        SalesVATEntity salesVATEntity = salesVATRepository.findById(salesVATRequest.getSalesVATId()).orElseThrow(() -> new RuntimeException("존재하지 않는 항목입니다."));
        CustomerEntity customer = customerRepository.findById(salesVATRequest.getCustomerId()).orElseThrow(() -> new RuntimeException("존재하지 않는 고객입니다."));
        salesVATEntity.updateFromRequest(salesVATRequest, customer);
        salesVATRepository.save(salesVATEntity);
    }

    public void deleteSalesVAT(SalesVATRequest salesVATRequest) {
        try {
            salesVATRepository.deleteById(salesVATRequest.getSalesVATId());
            salesVATRepository.flush();
        } catch (Exception e) {
            throw new ResourceInUseException("매출부가세를 삭제할 수 없습니다. 관련된 데이터가 존재합니다.", e);
        }
    }

    public List<SalesVATResponse> getSalesVAT(SalesVATRequest salesVATRequest) {
        System.out.println("salesVATRequest.getSalesVATId() : " + salesVATRequest.getSalesVATId());
        List<SalesVATEntity> salesVATEntities = salesVATRepository.findAll((root, query, criteriaBuilder) -> {
            //조건문 사용을 위한 객체
            List<Predicate> predicates = new ArrayList<>();

            if (salesVATRequest.getSalesVATId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("salesVATId"), salesVATRequest.getSalesVATId()));
            } else {

                if (salesVATRequest.getSearchSDate() != null && salesVATRequest.getSearchEDate() != null) {
                    predicates.add(criteriaBuilder.between(root.get("date"), salesVATRequest.getSearchSDate(), salesVATRequest.getSearchEDate()));
                }

                if (salesVATRequest.getCustomerName() != null) {
                    predicates.add(criteriaBuilder.like(root.get("customerId").get("customerName"), "%" + salesVATRequest.getCustomerName() + "%"));
                }
            }
            // 동적 조건을 조합하여 반환
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        });
        System.out.println(salesVATEntities.size());
        return salesVATEntities.stream().map(convertResponseService::convertToSalesVATResponse).collect(Collectors.toList());
    }

    public void salesVATPaid(SalesVATRequest salesVATRequest) {
        SalesVATEntity salesVATEntity = salesVATRepository.findById(salesVATRequest.getSalesVATId()).orElseThrow(() -> new RuntimeException("존재하지 않는 항목입니다."));
        salesVATEntity.setPaid(!salesVATEntity.isPaid());

        if (salesVATEntity.isPaid()) {
            ReceiptEntity receipt = receiptRepository.save(new ReceiptEntity(
                    null,
                    null,
                    LocalDateTime.now(),
                    ReceiptCategory.DEPOSIT,
                    salesVATEntity.getCustomerId(),
                    null,
                    null,
                    1,
                    salesVATEntity.getTotal(),
                    salesVATEntity.getPaymentDetails(),
                    salesVATEntity.getMemo(),
                    FromCategory.SALES));
            salesVATEntity.setReceiptId(receipt.getReceiptId());
            salesVATEntity.setPaidDate(salesVATRequest.getPaidDate());
            salesVATRequest.setReceiptId(salesVATEntity.getReceiptId());
            globalService.updateDailyTotal(receipt.getTotalPrice(), receipt.getCategory(), receipt.getTimeStamp());
        } else {
            ReceiptEntity receipt = receiptRepository.findById(salesVATEntity.getReceiptId()).orElseThrow(() -> new RuntimeException("전표가 존재하지 않습니다."));
            globalService.updateDailyTotal(receipt.getTotalPrice().negate(), receipt.getCategory(), receipt.getTimeStamp());
            receiptRepository.deleteById(salesVATEntity.getReceiptId());
            salesVATRequest.setReceiptId(salesVATEntity.getReceiptId());
            salesVATEntity.setReceiptId(null);
            salesVATEntity.setPaidDate(null);
        }
        salesVATRepository.save(salesVATEntity);
    }
}
