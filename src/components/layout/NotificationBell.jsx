// src/components/layout/NotificationBell.jsx
import React, { useState } from "react";
import {
  IconButton, Badge, Popover, Box, Typography,
  List, ListItem, ListItemText, Divider, Button,
  Tooltip, Chip,
} from "@mui/material";
import {
  Notifications, NotificationsNone, DoneAll,
  FiberManualRecord, Circle,
} from "@mui/icons-material";
import useNotifications from "../../hooks/useNotifications";

export default function NotificationBell() {
  const [anchorEl, setAnchorEl] = useState(null);
  const {
    notifications,
    nonLues,
    connected,
    marquerCommeLu,
    toutMarquerCommeLu,
    supprimerNotification,
  } = useNotifications();

  const open = Boolean(anchorEl);

  return (
    <>
      <Tooltip title={connected ? "Notifications" : "Déconnecté"}>
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ color: "#8892a4", "&:hover": { color: "#fff" } }}
        >
          <Badge badgeContent={nonLues} color="error" max={99}>
            {nonLues > 0
              ? <Notifications sx={{ color: "#e94560" }} />
              : <NotificationsNone />
            }
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          sx: {
            width: 360,
            bgcolor: "#1a1a2e",
            border: "1px solid #0f3460",
            borderRadius: 2,
            boxShadow: "0 8px 32px #00000060",
            mt: 1,
          },
        }}
      >
        {/* Header popover */}
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, py: 1.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography fontWeight={700} sx={{ color: "#eaeaea", fontSize: 14 }}>
              Notifications
            </Typography>
            <Circle sx={{ fontSize: 8, color: connected ? "#4caf50" : "#f44336" }} />
          </Box>
          {nonLues > 0 && (
            <Button
              size="small"
              startIcon={<DoneAll fontSize="small" />}
              onClick={toutMarquerCommeLu}
              sx={{ color: "#8892a4", fontSize: 11, textTransform: "none",
                "&:hover": { color: "#e94560" } }}
            >
              Tout lire
            </Button>
          )}
        </Box>

        <Divider sx={{ borderColor: "#0f3460" }} />

        {/* Liste */}
        {notifications.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <NotificationsNone sx={{ color: "#8892a4", fontSize: 40, mb: 1 }} />
            <Typography variant="body2" sx={{ color: "#8892a4" }}>
              Aucune notification
            </Typography>
          </Box>
        ) : (
          <List disablePadding sx={{ maxHeight: 360, overflowY: "auto",
            "&::-webkit-scrollbar": { width: 4 },
            "&::-webkit-scrollbar-thumb": { bgcolor: "#0f3460", borderRadius: 2 },
          }}>
            {notifications.map((notif, index) => (
              <React.Fragment key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => marquerCommeLu(notif.id)}
                  sx={{
                    cursor: "pointer",
                    bgcolor: notif.lu ? "transparent" : "#0f346015",
                    "&:hover": { bgcolor: "#0f3460" },
                    transition: "all 0.15s",
                    pr: 1,
                  }}
                  secondaryAction={
                    !notif.lu && (
                      <FiberManualRecord sx={{ fontSize: 8, color: "#e94560", mt: 1 }} />
                    )
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography variant="body2" fontWeight={notif.lu ? 400 : 600}
                          sx={{ color: "#eaeaea", fontSize: 13 }}>
                          {notif.titre || "Notification"}
                        </Typography>
                        {notif.type && (
                          <Chip label={notif.type} size="small"
                            sx={{ fontSize: 9, height: 16, bgcolor: "#e9456020",
                              color: "#e94560", border: "1px solid #e9456040" }} />
                        )}
                      </Box>
                    }
                    secondary={
                      <Typography variant="caption" sx={{ color: "#8892a4", fontSize: 11 }}>
                        {notif.message || ""}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && (
                  <Divider sx={{ borderColor: "#0f346030" }} />
                )}
              </React.Fragment>
            ))}
          </List>
        )}
      </Popover>
    </>
  );
}