package com.bodaboda.repository;
import com.bodaboda.entity.LogEntry;
import org.springframework.data.jpa.repository.JpaRepository;
public interface LogRepository extends JpaRepository<LogEntry, Long> {}
