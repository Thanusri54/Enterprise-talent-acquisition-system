package com.enterprise.notification.service;

import com.enterprise.notification.entity.Notification;
import com.enterprise.notification.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public Notification sendNotification(Notification notification) {
        return notificationRepository.save(notification);
    }

    public List<Notification> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc();
    }

    public List<Notification> getNotificationsForUser(Long userId, String email) {
        if (userId != null) {
            return notificationRepository.findByRecipientIdOrderByCreatedAtDesc(userId);
        } else if (email != null && !email.isBlank()) {
            return notificationRepository.findByRecipientEmailOrderByCreatedAtDesc(email);
        }
        return getAllNotifications();
    }

    public Notification markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found with ID: " + id));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
}
